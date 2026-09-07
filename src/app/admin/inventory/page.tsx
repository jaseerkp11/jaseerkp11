import { prisma } from "@/lib/prisma";
import { availableStock } from "@/lib/services/inventory";
import { InventoryForm } from "@/components/admin/inventory-form";
import { Pagination } from "@/components/admin/pagination";

export const dynamic = "force-dynamic";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1"));
  const pageSize = 20;
  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { sku: { contains: q } },
    ];
  }
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { name: "asc" },
      include: { inventoryEvents: { orderBy: { createdAt: "desc" }, take: 3 } },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div>
      <h1 className="font-display text-3xl">Inventory</h1>
      <p className="mt-1 text-sm text-muted">Stock changes write a ledger row. Do not overwrite silently.</p>
      <InventoryForm products={products} />
      <div className="mt-6">
        <form method="get" className="flex items-center gap-2">
          <input name="q" defaultValue={q ?? ""} placeholder="Search products..." className="h-11 w-full max-w-md rounded-xl border border-line bg-card px-3 text-sm" />
          <button type="submit" className="h-11 rounded-full border border-line px-4 text-sm">Search</button>
        </form>
      </div>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">SKU</th>
              <th>On hand</th>
              <th>Reserved</th>
              <th>Available</th>
              <th>Last event</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  {p.name}
                  <span className="block text-xs text-muted">{p.sku}</span>
                </td>
                <td>{p.stock}</td>
                <td>{p.reservedStock}</td>
                <td>{availableStock(p.stock, p.reservedStock)}</td>
                <td className="text-xs text-muted">
                  {p.inventoryEvents[0]
                    ? `${p.inventoryEvents[0].reason} ${p.inventoryEvents[0].delta}`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} baseUrl="/admin/inventory" searchParams={{ q }} />
    </div>
  );
}
