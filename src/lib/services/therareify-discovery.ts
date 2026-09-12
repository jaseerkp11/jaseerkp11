import { prisma } from "@/lib/prisma";

type ProductWithRelations = {
  id: string;
  name: string;
  slug: string;
  sellingPaise: number;
  compareAtPaise: number | null;
  stock: number;
  featured: boolean;
  trending: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  category?: { id: string; name: string; slug: string } | null;
  reviews?: Array<{ rating: number }>;
  images?: Array<{ url: string; alt: string }>;
};

export function whyTherareifyPicked(product: ProductWithRelations, query?: string) {
  const reasons: string[] = [];
  if (product.featured) reasons.push("Featured by TheRareify");
  if (product.trending) reasons.push("Trending now");
  if (product.bestSeller) reasons.push("Best seller");
  if (product.newArrival) reasons.push("New arrival");
  if (product.compareAtPaise && product.compareAtPaise > product.sellingPaise) {
    reasons.push("On sale");
  }
  if (product.stock > 0 && product.stock <= 5) reasons.push("Almost gone");
  if (product.reviews && product.reviews.length > 0) {
    const avg = product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length;
    if (avg >= 4) reasons.push("Highly rated");
  }
  if (query) {
    const q = query.toLowerCase();
    const text = [product.name, product.category?.name, product.category?.slug].filter(Boolean).join(" ").toLowerCase();
    if (text.includes(q)) reasons.push("Matches your search");
  }
  return reasons.slice(0, 4);
}

export async function getPairsWellWith(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, categoryId: true, sellingPaise: true, name: true, slug: true },
  });
  if (!product) return [];

  const [sameCategory, similarPrice] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE", id: { not: productId }, categoryId: product.categoryId, stock: { gt: 0 } },
      take: 6,
      orderBy: { featured: "desc", trending: "desc" },
      include: {
        images: { take: 1, orderBy: { position: "asc" } },
        category: true,
        reviews: { where: { status: "APPROVED" }, select: { rating: true } },
      },
    }),
    prisma.product.findMany({
      where: {
        status: "ACTIVE",
        id: { not: productId },
        stock: { gt: 0 },
        sellingPaise: { lte: product.sellingPaise * 1.2, gte: product.sellingPaise * 0.8 },
      },
      take: 6,
      orderBy: { featured: "desc", trending: "desc" },
      include: {
        images: { take: 1, orderBy: { position: "asc" } },
        category: true,
        reviews: { where: { status: "APPROVED" }, select: { rating: true } },
      },
    }),
  ]);

  const seen = new Set<string>();
  const combined = [...sameCategory, ...similarPrice];
  return combined.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}
