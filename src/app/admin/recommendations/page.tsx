import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function RecommendationsPage() {
  const events = await prisma.analyticsEvent.findMany({
    where: { name: "ai_query" },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const stats = {
    total: events.length,
    withResults: events.filter((e) => {
      try {
        const meta = JSON.parse(e.metadata);
        return (meta.resultCount ?? 0) > 0;
      } catch {
        return false;
      }
    }).length,
  };

  return (
    <div>
      <h1 className="font-display text-3xl">Recommendations</h1>
      <p className="mt-1 text-sm text-muted">Ask Atria queries and results from real catalogue data.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="text-xs text-muted">Total AI queries</p>
          <p className="font-display text-2xl">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="text-xs text-muted">Queries with results</p>
          <p className="font-display text-2xl">{stats.withResults}</p>
        </div>
      </div>
      <ul className="mt-8 divide-y divide-line rounded-2xl border border-line bg-card text-sm">
        {events.length === 0 ? (
          <li className="px-4 py-8 text-muted">No recommendation data yet.</li>
        ) : (
          events.map((e) => {
            let meta: Record<string, unknown> = {};
            try {
              meta = JSON.parse(e.metadata);
            } catch {}
            return (
              <li key={e.id} className="flex justify-between px-4 py-3">
                <span>{String(meta.query ?? e.path ?? "")}</span>
                <span className="text-muted">{String(meta.resultCount ?? 0)} results</span>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
