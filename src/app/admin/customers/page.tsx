import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <h1 className="font-display text-3xl">Customers</h1>
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
    </div>
  );
}
