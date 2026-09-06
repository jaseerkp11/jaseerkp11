import type { Prisma } from "@prisma/client";

export const productCardInclude = {
  images: { orderBy: { position: "asc" as const }, take: 2 },
  reviews: { where: { status: "APPROVED" as const }, select: { rating: true } },
  category: true,
} as const satisfies Prisma.ProductInclude;

export const productCardIncludeWithStock = {
  images: { orderBy: { position: "asc" as const }, take: 2 },
  reviews: { where: { status: "APPROVED" as const }, select: { rating: true } },
  category: true,
  stock: true,
  reservedStock: true,
} as any satisfies Prisma.ProductInclude;

export function averageRating(reviews: Array<{ rating: number }>): {
  value: number;
  count: number;
} {
  if (!reviews.length) return { value: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return { value: Number((sum / reviews.length).toFixed(1)), count: reviews.length };
}
