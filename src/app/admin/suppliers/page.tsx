import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    include: { _count: { select: { products: true, mappings: true } } },
  });
  return (
    <div>
      <h1 className="font-display text-3xl">Suppliers</h1>
      <form action="/api/admin/suppliers" method="post" className="mt-6 grid max-w-xl gap-3 rounded-2xl border border-line bg-card p-5">
        <input name="name" required placeholder="Name" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <input name="contactPerson" placeholder="Contact" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <input name="email" placeholder="Email" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <input name="phone" placeholder="Phone" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <textarea name="notes" placeholder="Notes" className="min-h-20 rounded-xl border border-line px-3 py-2 text-sm" />
        <button className="h-11 rounded-full bg-primary text-sm text-[#f6f1ea]">Add supplier</button>
      </form>
      <ul className="mt-8 divide-y divide-line rounded-2xl border border-line bg-card">
        {suppliers.map((s) => (
          <li key={s.id} className="px-4 py-3 text-sm">
            <p className="font-medium">{s.name}</p>
            <p className="text-muted">
              {s._count.products} products · {s._count.mappings} mappings
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
