import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/product-card";
import { productCardInclude } from "@/lib/catalog";
import { EmptyState } from "@/components/ui/empty-state";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const take = 12;
  const where: Prisma.ProductWhereInput = { status: "ACTIVE" };
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (params.sort === "trending") where.trending = true;
  if (params.sort === "best") where.bestSeller = true;
  if (params.sort === "new") where.newArrival = true;
  if (params.sort === "deals") where.compareAtPaise = { not: null };
  if (params.sort === "price-asc") orderBy = { sellingPaise: "asc" };
  if (params.sort === "price-desc") orderBy = { sellingPaise: "desc" };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: productCardInclude,
      orderBy,
      skip: (page - 1) * take,
      take,
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl">All products</h1>
      <p className="mt-2 text-sm text-muted">{total} items</p>
      {products.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="No products yet"
            description="The catalogue is empty. Add products in admin after seeding the database."
            action={{ href: "/admin/products/new", label: "Open admin" }}
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
