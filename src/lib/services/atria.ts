import { prisma } from "@/lib/prisma";
import { trackEvent } from "@/lib/analytics/track";
import { whyAtriaPicked } from "./atria-discovery";

type IntentHint = {
  intent: "gift" | "travel" | "desk" | "study" | "room" | "kitchen" | "fashion" | "beauty" | "electronics" | "general";
  confidence: number;
};

type BudgetHint = {
  minPaise: number;
  maxPaise: number;
};

export function detectIntent(query: string): IntentHint {
  const q = query.toLowerCase();
  const intents: Array<{ intent: IntentHint["intent"]; confidence: number }> = [];

  if (/\bgift\b|gift\s+under|present/.test(q)) intents.push({ intent: "gift", confidence: 0.9 });
  if (/\btravel|trip|vacation|weekend\s+bag|carry\s+on/.test(q)) intents.push({ intent: "travel", confidence: 0.85 });
  if (/\bdesk|workstation|monitor|keyboard|mouse|standing\s+desk/.test(q)) intents.push({ intent: "desk", confidence: 0.9 });
  if (/\bstudy|exam|notes|notebook|pen|stationery/.test(q)) intents.push({ intent: "study", confidence: 0.85 });
  if (/\broom|bedroom|living|sofa|lamp|fragrance|candle/.test(q)) intents.push({ intent: "room", confidence: 0.8 });
  if (/\bkitchen|cook|bottle|tawa|mug|mat|food/.test(q)) intents.push({ intent: "kitchen", confidence: 0.85 });
  if (/\btee|shirt|skirt|belt|bag|tote|apparel|wear|clothes|cloth/.test(q)) intents.push({ intent: "fashion", confidence: 0.8 });
  if (/\bskin|hair|toner|oil|soap|beauty|care/.test(q)) intents.push({ intent: "beauty", confidence: 0.85 });
  if (/\bfan|earbud|phone|gadget|tech|device|stand/.test(q)) intents.push({ intent: "electronics", confidence: 0.8 });

  if (intents.length === 0) return { intent: "general", confidence: 0.5 };

  const best = intents.sort((a, b) => b.confidence - a.confidence)[0];
  return best;
}

export function detectBudget(query: string): BudgetHint | undefined {
  const q = query.toLowerCase();
  const underMatch = q.match(/under\s+(?:₹|rs\.?|inr)?\s*([0-9,]+)/);
  const aboveMatch = q.match(/above\s+(?:₹|rs\.?|inr)?\s*([0-9,]+)/);
  const rangeMatch = q.match(/(?:₹|rs\.?|inr)?\s*([0-9,]+)\s*[-–to]+\s*(?:₹|rs\.?|inr)?\s*([0-9,]+)/);
  const singleMatch = q.match(/(?:₹|rs\.?|inr)?\s*([0-9,]+)/);

  if (rangeMatch) {
    const min = Number(rangeMatch[1].replace(/,/g, ""));
    const max = Number(rangeMatch[2].replace(/,/g, ""));
    return { minPaise: min * 100, maxPaise: max * 100 };
  }
  if (underMatch) {
    const max = Number(underMatch[1].replace(/,/g, ""));
    return { minPaise: 0, maxPaise: max * 100 };
  }
  if (aboveMatch) {
    const min = Number(aboveMatch[1].replace(/,/g, ""));
    return { minPaise: min * 100, maxPaise: 9999999999 };
  }
  if (singleMatch) {
    const value = Number(singleMatch[1].replace(/,/g, ""));
    if (value > 0 && value < 100000) {
      return { minPaise: 0, maxPaise: value * 100 };
    }
  }
  return undefined;
}

export async function askAtria(input: {
  query: string;
  sessionId?: string;
  userId?: string;
  intent?: string;
  budgetMin?: number;
  budgetMax?: number;
}) {
  const q = input.query.trim();
  if (!q) return { products: [], message: "Please enter a query." };

  const brandKeywords = ["atria", "store", "shop", "website"];
  const cleanQuery = brandKeywords.reduce((acc, kw) => acc.replace(new RegExp(kw, "gi"), ""), q).trim();
  const query = cleanQuery || q;

  const detectedIntent = detectIntent(q);
  const detectedBudget = detectBudget(q);
  const budgetMin = input.budgetMin ?? detectedBudget?.minPaise ?? 0;
  const budgetMax = input.budgetMax ?? detectedBudget?.maxPaise ?? 9999999999;

  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      stock: { gt: 0 },
      sellingPaise: { lte: budgetMax, gte: budgetMin },
      OR: [
        { name: { contains: query } },
        { description: { contains: query } },
        { shortDescription: { contains: query } },
        { brand: { contains: query } },
      ],
    },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      category: true,
      reviews: { where: { status: "APPROVED" }, select: { rating: true } },
    },
    take: 12,
    orderBy: { featured: "desc", trending: "desc", createdAt: "desc" },
  });

  const ranked = products
    .map((p) => {
      let score = 0;
      if (p.featured) score += 3;
      if (p.trending) score += 2;
      if (p.bestSeller) score += 2;
      if (p.newArrival) score += 1;
      if (p.compareAtPaise && p.compareAtPaise > p.sellingPaise) score += 1;
      const avgReview = p.reviews.length
        ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
        : 0;
      if (avgReview >= 4) score += 1;
      if (detectedIntent.intent !== "general" && p.category?.slug) {
        const categoryMatch = p.category.slug.includes(detectedIntent.intent);
        if (categoryMatch) score += 2;
      }
      return { product: p, score };
    })
    .sort((a, b) => b.score - a.score);

  const message = ranked.length
    ? `I found a few things that could help with "${q}".`
    : `I couldn't find a perfect match for "${q}" yet. Here are some alternatives from our catalogue.`;

  await trackEvent({
    name: "ai_query",
    metadata: {
      query: q,
      resultCount: ranked.length,
      sessionId: input.sessionId,
      userId: input.userId,
      intent: detectedIntent.intent,
      budgetMin,
      budgetMax,
    },
  });

  return {
    products: ranked.map((r) => ({
      ...r.product,
      reasons: whyAtriaPicked(r.product, q),
      score: r.score,
    })),
    message,
    intent: detectedIntent.intent,
    budget: { minPaise: budgetMin, maxPaise: budgetMax },
    refinements: ["cheaper", "more options", "different style"],
  };
}

export async function surpriseMe(options?: { sessionId?: string; userId?: string; excludeProductId?: string }) {
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      stock: { gt: 0 },
      ...(options?.excludeProductId ? { id: { not: options.excludeProductId } } : {}),
    },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      category: true,
      reviews: { where: { status: "APPROVED" }, select: { rating: true } },
    },
    orderBy: [
      { featured: "desc" },
      { trending: "desc" },
      { createdAt: "desc" },
    ],
    take: 20,
  });

  const scored = products
    .map((p) => {
      let score = 0;
      if (p.featured) score += 3;
      if (p.trending) score += 2;
      if (p.bestSeller) score += 2;
      if (p.newArrival) score += 1;
      return { product: p, score };
    })
    .sort((a, b) => b.score - a.score);

  const selected = scored[0]?.product ?? null;

  if (selected) {
    await trackEvent({
      name: "surprise_me",
      productId: selected.id,
      metadata: { sessionId: options?.sessionId, userId: options?.userId },
    });
  }

  return selected;
}

export async function getDemandSignals(days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const [searches, aiQueries, productViews, addToCarts] = await Promise.all([
    prisma.analyticsEvent.groupBy({
      by: ["path"],
      where: { name: "search", createdAt: { gte: since }, path: { not: null } },
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

  const productIds = Array.from(productMap.keys());
  const products = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, slug: true },
      })
    : [];
  const productNameMap = new Map(products.map((p) => [p.id, p]));

  return {
    searches,
    aiQueries: aiQueries.map((row) => ({ query: row.path ?? "", count: row._count.path })),
    products: Array.from(productMap.entries())
      .map(([id, data]) => ({ product: productNameMap.get(id), ...data }))
      .filter((row) => row.product),
  };
}
