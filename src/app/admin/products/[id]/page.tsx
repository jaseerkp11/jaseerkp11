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
      <h1 className="font-display text-3xl">Edit product</h1>
      <p className="mt-2 text-sm text-muted">
        Photo boxes are at the top of this page (main + 4 extra). Profit{" "}
        {formatMoney(profitPaise(product.sellingPaise, product.costPaise))} · margin{" "}
        {marginPercent(product.sellingPaise, product.costPaise)}%. Customers never see cost.
      </p>
      <ProductForm categories={categories} suppliers={suppliers} product={product} />
    </div>
  );
}
