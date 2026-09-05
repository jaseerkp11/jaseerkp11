import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewFindPage() {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, sku: true },
  });
  return (
    <div>
      <h1 className="font-display text-3xl">New Find</h1>
      <form action="/api/admin/finds" method="post" className="mt-6 grid max-w-3xl gap-4 rounded-2xl border border-line bg-card p-5">
        <input name="name" required placeholder="Find name" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <input name="slug" required placeholder="slug" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <input name="imageUrl" placeholder="Image URL" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <textarea name="shortDescription" placeholder="Short description" className="min-h-20 rounded-xl border border-line px-3 py-2 text-sm" />
        <textarea name="description" placeholder="Full description" className="min-h-32 rounded-xl border border-line px-3 py-2 text-sm" />
        <input name="sortOrder" type="number" defaultValue={0} className="h-11 rounded-xl border border-line px-3 text-sm" />
        <select name="status" className="h-11 rounded-xl border border-line px-3 text-sm">
          <option>DRAFT</option>
          <option>ACTIVE</option>
          <option>ARCHIVED</option>
        </select>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Products</legend>
          <p className="text-xs text-muted">Select products to include in this find.</p>
          <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-line p-3">
            {products.map((p) => (
              <label key={p.id} className="flex items-center gap-2 py-1 text-sm">
                <input type="checkbox" name="productIds" value={p.id} />
                <span>{p.name}</span>
                <span className="text-xs text-muted">{p.sku}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <button className="h-11 rounded-full bg-primary text-sm text-[#f6f1ea]">Create find</button>
      </form>
    </div>
  );
}
