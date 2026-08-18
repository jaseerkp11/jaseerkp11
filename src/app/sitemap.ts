import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { publicUrl } from "@/config/brand";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, pages] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.cmsPage.findMany({ select: { slug: true, updatedAt: true } }),
  ]);

  return [
    { url: publicUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: publicUrl("/faq"), changeFrequency: "monthly", priority: 0.5 },
    { url: publicUrl("/track"), changeFrequency: "monthly", priority: 0.5 },
    ...categories.map((c) => ({
      url: publicUrl(`/category/${c.slug}`),
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: publicUrl(`/products/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...pages.map((p) => ({
      url: publicUrl(`/pages/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
