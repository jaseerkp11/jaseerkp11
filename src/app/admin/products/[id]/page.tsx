import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { formatMoney, marginPercent, profitPaise } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { position: "asc" } }, variants: true },
  });
  if (!product) notFound();
  const [categories, suppliers] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
  ]);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Edit product</h1>
          <p className="mt-2 text-sm text-muted">
            Photo boxes are at the top of this page (main + 4 extra). Profit{" "}
            {formatMoney(profitPaise(product.sellingPaise, product.costPaise))} · margin{" "}
            {marginPercent(product.sellingPaise, product.costPaise)}%. Customers never see cost.
          </p>
        </div>
        <form action={`/api/admin/products/${product.id}`} method="post" onSubmit={(event) => { if (!confirm("Delete this product?")) event.preventDefault(); }}>
          <input type="hidden" name="_method" value="DELETE" />
          <button type="submit" className="inline-flex h-10 items-center rounded-full border border-red-200 bg-red-50 px-4 text-sm text-red-700 hover:bg-red-100">Delete product</button>
        </form>
      </div>
      <ProductForm categories={categories} suppliers={suppliers} product={product} />
    </div>
  );
}
