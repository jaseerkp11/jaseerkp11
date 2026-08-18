import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney, marginPercent } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const products = await prisma.product.findMany({
    where: q
      ? {
          OR: [{ name: { contains: q } }, { sku: { contains: q } }],
        }
      : undefined,
    include: {
      category: true,
      supplier: true,
      images: { orderBy: { position: "asc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Products</h1>
        <Link href="/admin/products/new" className="rounded-full bg-primary px-4 py-2 text-sm text-[#f6f1ea]">
          Add product
        </Link>
      </div>
      <p className="mt-2 text-sm text-muted">
        Click a product name to edit. Photo slots (main + 4 extra) are at the top of the edit page.
      </p>
      <form className="mt-4">
        <input name="q" defaultValue={q} placeholder="Search name or SKU" className="h-11 w-full max-w-md rounded-xl border border-line bg-card px-3 text-sm" />
      </form>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th>SKU</th>
              <th>Sell</th>
              <th>Cost</th>
              <th>Margin</th>
              <th>Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                    {p.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.images[0].url}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded-lg object-cover bg-[#ece6dc]"
                      />
                    ) : (
                      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#ece6dc] text-[10px] text-muted">
                        No img
                      </span>
                    )}
                    <span>
                      <span className="block font-medium underline">{p.name}</span>
                      <span className="block text-xs text-muted no-underline">{p.category.name}</span>
                    </span>
                  </Link>
                </td>
                <td>{p.sku}</td>
                <td>{formatMoney(p.sellingPaise)}</td>
                <td>{formatMoney(p.costPaise)}</td>
                <td>{marginPercent(p.sellingPaise, p.costPaise)}%</td>
                <td>{p.stock - p.reservedStock}</td>
                <td>{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
