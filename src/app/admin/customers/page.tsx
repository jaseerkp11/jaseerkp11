import { prisma } from "@/lib/prisma";
import { AdminFilters } from "@/components/admin/filters-form";
import { Pagination } from "@/components/admin/pagination";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1"));
  const pageSize = 20;
  const where: Record<string, unknown> = { role: "CUSTOMER" };
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { email: { contains: q } },
    ];
  }
  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { _count: { select: { orders: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div>
      <h1 className="font-display text-3xl">Customers</h1>
      <AdminFilters defaultQ={q ?? ""} />
      {customers.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No customer accounts yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-card">
          {customers.map((c) => (
            <li key={c.id} className="px-4 py-3 text-sm">
              <p className="font-medium">{c.name}</p>
              <p className="text-muted">
                {c.email} · {c._count.orders} orders
              </p>
            </li>
          ))}
        </ul>
      )}
      <Pagination page={page} totalPages={totalPages} baseUrl="/admin/customers" searchParams={{ q }} />
    </div>
  );
}
