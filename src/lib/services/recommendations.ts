import { prisma } from "@/lib/prisma";

type RecommendationResult = {
  type: "related" | "frequently_bought_together" | "complementary" | "trending" | "featured";
  products: Array<{
    id: string;
    name: string;
    slug: string;
    sellingPaise: number;
    compareAtPaise: number | null;
    stock: number;
    reservedStock: number;
    images: Array<{ url: string; alt: string }>;
    category: { id: string; name: string; slug: string } | null;
    reviews: Array<{ rating: number }>;
  }>;
};

export async function getRecommendationsForProduct(productId: string): Promise<RecommendationResult[]> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, categoryId: true, sellingPaise: true, status: true },
  });
  if (!product || product.status !== "ACTIVE") return [];

  const [related, complementary, trending] = await Promise.all([
    prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: productId }, status: "ACTIVE" },
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        category: true,
        reviews: { where: { status: "APPROVED" }, select: { rating: true } },
      },
      take: 4,
      orderBy: { featured: "desc", trending: "desc" },
    }),
    prisma.product.findMany({
      where: {
        status: "ACTIVE",
        id: { not: productId },
        sellingPaise: { lte: product.sellingPaise * 1.3, gte: product.sellingPaise * 0.7 },
      },
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        category: true,
        reviews: { where: { status: "APPROVED" }, select: { rating: true } },
      },
      take: 4,
      orderBy: { bestSeller: "desc", trending: "desc" },
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE", id: { not: productId }, trending: true },
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        category: true,
        reviews: { where: { status: "APPROVED" }, select: { rating: true } },
      },
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return [
    { type: "related", products: related },
    { type: "complementary", products: complementary },
    { type: "trending", products: trending },
  ];
}

export async function getPersonalizedRecommendations(options?: { userId?: string; sessionId?: string; excludeProductId?: string }) {
  const baseWhere: Record<string, unknown> = {
    status: "ACTIVE",
    stock: { gt: 0 },
    ...(options?.excludeProductId ? { id: { not: options.excludeProductId } } : {}),
  };

  const [featured, bestSellers, newArrivals] = await Promise.all([
    prisma.product.findMany({
      where: { ...baseWhere, featured: true },
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        category: true,
        reviews: { where: { status: "APPROVED" }, select: { rating: true } },
      },
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { ...baseWhere, bestSeller: true },
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        category: true,
        reviews: { where: { status: "APPROVED" }, select: { rating: true } },
      },
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { ...baseWhere, newArrival: true },
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        category: true,
        reviews: { where: { status: "APPROVED" }, select: { rating: true } },
      },
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return [
    { type: "featured", products: featured },
    { type: "frequently_bought_together", products: bestSellers },
    { type: "trending", products: newArrivals },
  ];
}
