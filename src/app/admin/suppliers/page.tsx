import { prisma } from "@/lib/prisma";
import { SupplierForm } from "@/components/admin/supplier-form";
import { AdminFilters } from "@/components/admin/filters-form";
import { Pagination } from "@/components/admin/pagination";

export const dynamic = "force-dynamic";

export default async function SuppliersPage({
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
      { email: { contains: q } },
    ];
  }
  const [suppliers, total] = await Promise.all([
    prisma.supplier.findMany({
      where,
      include: { _count: { select: { products: true, mappings: true } } },
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.supplier.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div>
      <h1 className="font-display text-3xl">Suppliers</h1>
      <SupplierForm />
      <div className="mt-6">
        <AdminFilters defaultQ={q ?? ""} />
      </div>
      <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-card">
        {suppliers.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
            <span>
              <p className="font-medium">{s.name}</p>
              <p className="text-muted">
                {s._count.products} products · {s._count.mappings} mappings
              </p>
            </span>
            <form action={`/api/admin/suppliers/${s.id}`} method="post" onSubmit={(event) => { if (!confirm("Delete this supplier?")) event.preventDefault(); }}>
              <input type="hidden" name="_method" value="DELETE" />
              <button type="submit" className="text-xs text-red-600 hover:text-red-700">Delete</button>
            </form>
          </li>
        ))}
      </ul>
      <Pagination page={page} totalPages={totalPages} baseUrl="/admin/suppliers" searchParams={{ q }} />
    </div>
  );
}
