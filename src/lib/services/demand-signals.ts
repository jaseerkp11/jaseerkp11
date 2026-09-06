import { prisma } from "@/lib/prisma";

type DemandSignal = {
  query: string;
  normalizedQuery: string;
  searches: number;
  aiQueries: number;
  opportunity: "high" | "medium" | "low";
  confidence: number;
  trend: "up" | "down" | "stable";
  productCount: number;
  topProducts: Array<{ id: string; name: string; slug: string }>;
  missingDemand: boolean;
};

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "for",
  "in",
  "on",
  "at",
  "to",
  "of",
  "with",
  "by",
  "is",
  "it",
  "this",
  "that",
  "i",
  "me",
  "my",
  "we",
  "you",
  "your",
  "find",
  "looking",
  "need",
  "want",
  "best",
  "good",
  "very",
  "really",
  "under",
  "above",
  "around",
  "about",
  "from",
]);

function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w))
    .slice(0, 8)
    .join(" ");
}

function scoreOpportunity(searches: number, aiQueries: number, productCount: number): { opportunity: DemandSignal["opportunity"]; confidence: number } {
  const total = searches + aiQueries;
  if (total >= 50 && productCount <= 10) return { opportunity: "high", confidence: 0.9 };
  if (total >= 20 && productCount <= 20) return { opportunity: "high", confidence: 0.8 };
  if (total >= 10 && productCount <= 30) return { opportunity: "medium", confidence: 0.7 };
  if (total >= 5) return { opportunity: "medium", confidence: 0.6 };
  return { opportunity: "low", confidence: 0.4 };
}

export async function getDemandSignals(days = 30, compareDays = 7) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const compareSince = new Date(Date.now() - compareDays * 24 * 60 * 60 * 1000);

  const [recentSearches, olderSearches, recentAiQueries, productViews, addToCarts] = await Promise.all([
    prisma.analyticsEvent.groupBy({
      by: ["path"],
      where: { name: "search", createdAt: { gte: since }, path: { not: null } },
      _count: { path: true },
    }),
    prisma.analyticsEvent.groupBy({
      by: ["path"],
      where: { name: "search", createdAt: { gte: compareSince, lt: since }, path: { not: null } },
      _count: { path: true },
    }),
    prisma.analyticsEvent.groupBy({
      by: ["path"],
      where: { name: "ai_query", createdAt: { gte: since }, path: { not: null } },
      _count: { path: true },
    }),
    prisma.analyticsEvent.groupBy({
      by: ["productId"],
      where: { name: "product_view", createdAt: { gte: since }, productId: { not: null } },
      _count: { productId: true },
    }),
    prisma.analyticsEvent.groupBy({
      by: ["productId"],
      where: { name: "add_to_cart", createdAt: { gte: since }, productId: { not: null } },
      _count: { productId: true },
    }),
  ]);

  const queryMap = new Map<string, { searches: number; aiQueries: number; recentSearches: number }>();
  for (const row of recentSearches) {
    const q = row.path ?? "";
    const normalized = normalizeQuery(q);
    if (!normalized) continue;
    const existing = queryMap.get(normalized) || { searches: 0, aiQueries: 0, recentSearches: 0 };
    existing.searches += row._count.path;
    existing.recentSearches += row._count.path;
    queryMap.set(normalized, existing);
  }
  for (const row of recentAiQueries) {
    const q = row.path ?? "";
    const normalized = normalizeQuery(q);
    if (!normalized) continue;
    const existing = queryMap.get(normalized) || { searches: 0, aiQueries: 0, recentSearches: 0 };
    existing.aiQueries += row._count.path;
    queryMap.set(normalized, existing);
  }

  const olderQueryMap = new Map<string, number>();
  for (const row of olderSearches) {
    const q = row.path ?? "";
    const normalized = normalizeQuery(q);
    if (!normalized) continue;
    olderQueryMap.set(normalized, (olderQueryMap.get(normalized) ?? 0) + row._count.path);
  }

  const allProducts = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true, slug: true },
  });
  const productNameMap = new Map(allProducts.map((p) => [p.id, p]));

  const productMap = new Map<string, { views: number; carts: number }>();
  for (const row of productViews) {
    if (row.productId) productMap.set(row.productId, { views: row._count.productId, carts: 0 });
  }
  for (const row of addToCarts) {
    if (row.productId) {
      const existing = productMap.get(row.productId) || { views: 0, carts: 0 };
      existing.carts = row._count.productId;
      productMap.set(row.productId, existing);
    }
  }

  const signals: DemandSignal[] = Array.from(queryMap.entries()).map(([query, data]) => {
    const olderCount = olderQueryMap.get(query) ?? 0;
    const trend: DemandSignal["trend"] =
      data.recentSearches > olderCount * 1.2 ? "up" : data.recentSearches < olderCount * 0.8 ? "down" : "stable";

    const matchingProducts = allProducts.filter((p) => {
      const text = [p.name, p.slug].join(" ").toLowerCase();
      return query.split(" ").some((w) => w && text.includes(w));
    });

    const { opportunity, confidence } = scoreOpportunity(data.searches + data.aiQueries, data.aiQueries, matchingProducts.length);
    const topProducts = matchingProducts.slice(0, 3);

    return {
      query: data.searches > 0 ? `Search: ${query}` : `AI: ${query}`,
      normalizedQuery: query,
      searches: data.searches,
      aiQueries: data.aiQueries,
      opportunity,
      confidence,
      trend,
      productCount: matchingProducts.length,
      topProducts,
      missingDemand: matchingProducts.length === 0 && data.searches >= 5,
    };
  });

  signals.sort((a, b) => (b.searches + b.aiQueries) - (a.searches + a.aiQueries));

  return {
    signals: signals.slice(0, 50),
    summary: {
      totalQueries: signals.length,
      highOpportunity: signals.filter((s) => s.opportunity === "high").length,
      missingDemand: signals.filter((s) => s.missingDemand).length,
      trendingUp: signals.filter((s) => s.trend === "up").length,
    },
    products: Array.from(productMap.entries())
      .map(([id, data]) => ({ product: productNameMap.get(id), ...data }))
      .filter((row) => row.product),
  };
}
