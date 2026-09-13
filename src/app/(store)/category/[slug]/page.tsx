import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/product-card";
import { productCardInclude } from "@/lib/catalog";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { EmptyState } from "@/components/ui/empty-state";
import { publicUrl } from "@/config/brand";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return { title: "Category" };
  return {
    title: category.seoTitle ?? category.name,
    description: category.seoDescription ?? category.description,
    alternates: { canonical: publicUrl(`/category/${category.slug}`) },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ min?: string; max?: string; sort?: string; brand?: string }>;
}) {
  const { slug } = await params;
  const filters = await searchParams;
  const special = ["trending", "new-arrivals", "best-sellers", "deals"].includes(slug);
  const category = await prisma.category.findUnique({
    where: { slug },
    include: { children: true, parent: true },
  });
  if (!category && !special) notFound();

  const where: Prisma.ProductWhereInput = { status: "ACTIVE" };
  if (category && !special) {
    const ids = [category.id, ...category.children.map((c) => c.id)];
    where.categoryId = { in: ids };
  }
  if (slug === "trending") where.trending = true;
  if (slug === "new-arrivals") where.newArrival = true;
  if (slug === "best-sellers") where.bestSeller = true;
  if (slug === "deals") where.compareAtPaise = { not: null };
  if (filters.brand) where.brand = filters.brand;
  if (filters.min || filters.max) {
    where.sellingPaise = {};
    if (filters.min) where.sellingPaise.gte = Math.round(Number(filters.min) * 100);
    if (filters.max) where.sellingPaise.lte = Math.round(Number(filters.max) * 100);
  }

  const products = await prisma.product.findMany({
    where,
    include: productCardInclude,
    orderBy:
      filters.sort === "price-asc"
        ? { sellingPaise: "asc" }
        : filters.sort === "price-desc"
          ? { sellingPaise: "desc" }
          : { createdAt: "desc" },
  });

  const title = category?.name ?? slug.replace("-", " ");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: title }]} />
      {category?.bannerUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={category.bannerUrl} alt="" className="mt-6 h-48 w-full rounded-3xl object-cover" />
      ) : null}
      <h1 className="mt-6 font-display text-4xl capitalize">{title}</h1>
      {category?.description ? (
        <p className="mt-2 max-w-2xl text-sm text-muted">{category.description}</p>
      ) : null}
      <p className="mt-2 text-sm text-muted">{products.length} products</p>
      {products.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Nothing in this category yet"
            description="Add products in admin or choose another category."
            action={{ href: "/products", label: "Browse all" }}
          />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
