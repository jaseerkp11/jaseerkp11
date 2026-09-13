import { prisma } from "@/lib/prisma";
import type { Product } from "@prisma/client";

export type SearchHit = {
  type: "product" | "category";
  id: string;
  title: string;
  href: string;
  subtitle?: string;
};

export interface SearchProvider {
  suggest(query: string): Promise<SearchHit[]>;
  searchProducts(query: string): Promise<Product[]>;
}

export class DatabaseSearchProvider implements SearchProvider {
  async suggest(query: string): Promise<SearchHit[]> {
    const q = query.trim();
    if (q.length < 2) return [];
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: {
          status: "ACTIVE",
          OR: [
            { name: { contains: q } },
            { brand: { contains: q } },
            { sku: { contains: q } },
          ],
        },
        take: 6,
        select: { id: true, name: true, slug: true, brand: true },
      }),
      prisma.category.findMany({
        where: { name: { contains: q }, status: "ACTIVE" },
        take: 4,
        select: { id: true, name: true, slug: true },
      }),
    ]);
    return [
      ...categories.map((c) => ({
        type: "category" as const,
        id: c.id,
        title: c.name,
        href: `/category/${c.slug}`,
        subtitle: "Category",
      })),
      ...products.map((p) => ({
        type: "product" as const,
        id: p.id,
        title: p.name,
        href: `/products/${p.slug}`,
        subtitle: p.brand,
      })),
    ];
  }

  async searchProducts(query: string): Promise<Product[]> {
    const q = query.trim();
    if (!q) return [];
    return prisma.product.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
          { brand: { contains: q } },
          { sku: { contains: q } },
        ],
      },
      include: { images: { orderBy: { position: "asc" } }, category: true },
      take: 48,
    });
  }
}

export const searchProvider: SearchProvider = new DatabaseSearchProvider();
