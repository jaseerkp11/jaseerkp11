import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [orders, products, customers, lowStock] = await Promise.all([
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { items: true } }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      take: 40,
    }),
  ]);
  const paidish = await prisma.order.findMany({
    where: { paymentStatus: { in: ["PAID", "COD_PENDING"] } },
  });
  const revenue = paidish.reduce((s, o) => s + o.totalPaise, 0);
  const cost = paidish.reduce((s, o) => s + o.costPaise, 0);
  const aov = paidish.length ? Math.round(revenue / paidish.length) : 0;
  const pending = await prisma.order.count({ where: { status: "PENDING" } });
  const low = lowStock.filter((p) => p.stock - p.reservedStock <= p.lowStockThreshold);

  return (
    <div>
      <h1 className="font-display text-3xl">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">
        Figures come from stored orders. Empty charts mean no orders yet — they are not filled with sample sales.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Recognised revenue" value={formatMoney(revenue)} hint="Paid + COD pending totals" />
        <Stat label="Estimated product cost" value={formatMoney(cost)} hint="From order-line cost snapshots" />
        <Stat label="Estimated goods profit" value={formatMoney(revenue - cost)} hint="Does not subtract shipping fees or payment fees until those are recorded" />
        <Stat label="Average order" value={formatMoney(aov)} />
        <Stat label="Products" value={String(products)} />
        <Stat label="Customers" value={String(customers)} />
        <Stat label="Pending orders" value={String(pending)} />
        <Stat label="Low stock SKUs" value={String(low.length)} />
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-medium">Recent orders</h2>
          {orders.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No orders yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-card">
              {orders.map((order) => (
                <li key={order.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <Link href={`/admin/orders/${order.id}`} className="underline">
                    {order.orderNumber}
                  </Link>
                  <span>{order.status}</span>
                  <span>{formatMoney(order.totalPaise)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section>
          <h2 className="font-medium">Low stock</h2>
          {low.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No SKUs are at or below their threshold.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-card">
              {low.slice(0, 8).map((p) => (
                <li key={p.id} className="flex justify-between px-4 py-3 text-sm">
                  <Link href={`/admin/products/${p.id}`}>{p.name}</Link>
                  <span>{p.stock - p.reservedStock} available</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-5">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
