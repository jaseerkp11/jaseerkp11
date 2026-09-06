import { getDemandSignals } from "@/lib/services/demand-signals";

export const dynamic = "force-dynamic";

export default async function DemandSignalsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range = "30" } = await searchParams;
  const days = Number(range) || 30;
  const data = await getDemandSignals(days);

  return (
    <div>
      <h1 className="font-display text-3xl">Demand Signals</h1>
      <p className="mt-1 text-sm text-muted">Normalized demand signals from searches, Ask Atria, and product interest.</p>
      <div className="mt-4 flex gap-2 text-sm">
        {["7", "30", "90"].map((d) => (
          <a key={d} href={`/admin/demand-signals?range=${d}`} className="rounded-full border border-line bg-card px-3 py-1">
            {d} days
          </a>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="text-xs uppercase tracking-wide text-muted">Total signals</p>
          <p className="mt-2 font-display text-2xl">{data.summary.totalQueries}</p>
        </div>
        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="text-xs uppercase tracking-wide text-muted">High opportunity</p>
          <p className="mt-2 font-display text-2xl">{data.summary.highOpportunity}</p>
        </div>
        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="text-xs uppercase tracking-wide text-muted">Trending up</p>
          <p className="mt-2 font-display text-2xl">{data.summary.trendingUp}</p>
        </div>
        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="text-xs uppercase tracking-wide text-muted">Missing demand</p>
          <p className="mt-2 font-display text-2xl">{data.summary.missingDemand}</p>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="font-medium">Signals</h2>
        <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-card text-sm">
          {data.signals.length === 0 ? (
            <li className="px-4 py-6 text-muted">No signals in this range.</li>
          ) : (
            data.signals.map((s, i) => (
              <li key={i} className="flex flex-col gap-1 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{s.normalizedQuery}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted">{s.searches + s.aiQueries}</span>
                    <span className="rounded-full border border-line px-2 py-0.5 text-xs">
                      {s.trend === "up" ? "↑" : s.trend === "down" ? "↓" : "→"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted">
                  <span className={`rounded-full px-2 py-0.5 ${
                    s.opportunity === "high" ? "bg-[#2f6b4f] text-white" : s.opportunity === "medium" ? "bg-[#c4a574] text-white" : "bg-[#ece6dc] text-[#5c564e]"
                  }`}>
                    {s.opportunity} opportunity
                  </span>
                  <span>confidence {Math.round(s.confidence * 100)}%</span>
                  <span>{s.productCount} products</span>
                  {s.missingDemand ? <span className="text-[#b4553a]">missing demand</span> : null}
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-medium">Most viewed products</h2>
        <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-card text-sm">
          {data.products.length === 0 ? (
            <li className="px-4 py-6 text-muted">No product views in this range.</li>
          ) : (
            data.products.map((row) => (
              <li key={row.product!.id} className="flex justify-between px-4 py-3">
                <span>{row.product!.name}</span>
                <span className="text-muted">{row.views} views · {row.carts} carts</span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
