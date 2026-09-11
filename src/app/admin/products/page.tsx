import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney, marginPercent } from "@/lib/money";
import { AdminFilters } from "@/components/admin/filters-form";
import { Pagination } from "@/components/admin/pagination";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { q, status, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1"));
  const pageSize = 20;
  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { sku: { contains: q } },
    ];
  }
  if (status && ["DRAFT", "ACTIVE", "ARCHIVED", "OUT_OF_STOCK"].includes(status)) {
    where.status = status;
  }
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        supplier: true,
        images: { orderBy: { position: "asc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
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
      <AdminFilters defaultQ={q ?? ""} defaultStatus={status ?? ""} />
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
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
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
                  </div>
                </td>
                <td>{p.sku}</td>
                <td>{formatMoney(p.sellingPaise)}</td>
                <td>{formatMoney(p.costPaise)}</td>
                <td>{marginPercent(p.sellingPaise, p.costPaise)}%</td>
                <td>{p.stock - p.reservedStock}</td>
                <td>{p.status}</td>
                <td className="px-4 py-3 text-right">
                  <form action={`/api/admin/products/${p.id}`} method="post" onSubmit={(event) => { if (!confirm("Delete this product?")) event.preventDefault(); }}>
                    <input type="hidden" name="_method" value="DELETE" />
                    <button type="submit" className="text-xs text-red-600 hover:text-red-700">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} baseUrl="/admin/products" searchParams={{ q, status }} />
    </div>
  );
}
