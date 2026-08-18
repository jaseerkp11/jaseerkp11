import { prisma } from "@/lib/prisma";
import { availableStock } from "@/lib/services/inventory";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    include: { inventoryEvents: { orderBy: { createdAt: "desc" }, take: 3 } },
  });
  return (
    <div>
      <h1 className="font-display text-3xl">Inventory</h1>
      <p className="mt-1 text-sm text-muted">Stock changes write a ledger row. Do not overwrite silently.</p>
      <form action="/api/admin/inventory" method="post" className="mt-6 grid max-w-xl gap-3 rounded-2xl border border-line bg-card p-5">
        <select name="productId" required className="h-11 rounded-xl border border-line px-3 text-sm">
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.sku})
            </option>
          ))}
        </select>
        <input name="delta" type="number" required placeholder="Delta (e.g. 10 or -2)" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <input name="note" placeholder="Reason" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <button className="h-11 rounded-full bg-primary text-sm text-[#f6f1ea]">Record adjustment</button>
      </form>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-card">
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
    </div>
  );
}
