/* eslint-disable react-hooks/purity -- date windows are computed on the server per request */
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range = "30" } = await searchParams;
  const days = Number(range) || 30;
  // Server-rendered window; not a client render clock.
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const orders = await prisma.order.findMany({ where: { createdAt: { gte: since } } });
  const events = await prisma.analyticsEvent.groupBy({
    by: ["name"],
    where: { createdAt: { gte: since } },
    _count: { name: true },
  });
  const revenue = orders.reduce((s, o) => s + o.totalPaise, 0);
  const profit = orders.reduce((s, o) => s + (o.subtotalPaise - o.discountPaise - o.costPaise), 0);

  return (
    <div>
      <h1 className="font-display text-3xl">Analytics</h1>
      <p className="mt-1 text-sm text-muted">Only recorded events and orders. Empty means nothing happened in this window.</p>
      <div className="mt-4 flex gap-2 text-sm">
        {["7", "30", "90"].map((d) => (
          <a key={d} href={`/admin/analytics?range=${d}`} className="rounded-full border border-line bg-card px-3 py-1">
            {d} days
          </a>
        ))}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="text-xs text-muted">Orders</p>
          <p className="font-display text-3xl">{orders.length}</p>
        </div>
        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="text-xs text-muted">Revenue</p>
          <p className="font-display text-3xl">{formatMoney(revenue)}</p>
        </div>
        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="text-xs text-muted">Goods profit</p>
          <p className="font-display text-3xl">{formatMoney(profit)}</p>
        </div>
      </div>
      <ul className="mt-8 text-sm">
        {events.map((e) => (
          <li key={e.name}>
            {e.name}: {e._count.name}
          </li>
        ))}
        {events.length === 0 ? <li className="text-muted">No analytics events in this range.</li> : null}
      </ul>
    </div>
  );
}
