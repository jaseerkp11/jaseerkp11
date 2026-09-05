import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DemandSignalsPage() {
  const events = await prisma.analyticsEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const counts = new Map<string, number>();
  for (const ev of events) {
    let meta: Record<string, unknown> = {};
    try {
      meta = JSON.parse(ev.metadata) as Record<string, unknown>;
    } catch {
      // ignore
    }
    const key = String(meta.productId ?? ev.path ?? "");
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const top = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
  return (
    <div>
      <h1 className="font-display text-3xl">Demand signals</h1>
      <p className="mt-2 text-sm text-muted">Top viewed paths / product IDs from recent analytics events.</p>
      <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-card">
        {top.length === 0 ? (
          <li className="px-4 py-8 text-sm text-muted">No events yet.</li>
        ) : (
          top.map(([key, count]) => (
            <li key={key} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="font-mono">{key}</span>
              <span className="text-muted">{count} views</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
