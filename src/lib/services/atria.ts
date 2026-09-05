import { prisma } from "@/lib/prisma";
import { trackEvent } from "@/lib/analytics/track";

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

  const budgetFilter = input.budgetMax || input.budgetMin;
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      stock: { gt: 0 },
      AND: budgetFilter ? [{ sellingPaise: { lte: input.budgetMax ?? 99999999, gte: input.budgetMin ?? 0 } }] : [],
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

  const message = products.length
    ? `I found a few things that could help with "${q}".`
    : `I couldn't find a perfect match for "${q}" yet. Here are some alternatives from our catalogue.`;

  await trackEvent({
    name: "ai_query",
    metadata: { query: q, resultCount: products.length, sessionId: input.sessionId, userId: input.userId },
  });

  return { products, message };
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
    orderBy: { featured: "desc", trending: "desc", createdAt: "desc" },
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
