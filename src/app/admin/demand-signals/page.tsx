import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DemandSignalsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range = "30" } = await searchParams;
  const days = Number(range) || 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const searches = await prisma.analyticsEvent.groupBy({
    by: ["path"],
    where: { name: "search", createdAt: { gte: since }, path: { not: null } },
    _count: { path: true },
  });
  const aiQueries = await prisma.analyticsEvent.groupBy({
    by: ["path"],
    where: { name: "ai_query", createdAt: { gte: since }, path: { not: null } },
    _count: { path: true },
  });
  const productViews = await prisma.analyticsEvent.groupBy({
    by: ["productId"],
    where: { name: "product_view", createdAt: { gte: since }, productId: { not: null } },
    _count: { productId: true },
    orderBy: { _count: { productId: "desc" } },
    take: 20,
  });
  const addToCarts = await prisma.analyticsEvent.groupBy({
    by: ["productId"],
    where: { name: "add_to_cart", createdAt: { gte: since }, productId: { not: null } },
    _count: { productId: true },
    orderBy: { _count: { productId: "desc" } },
    take: 20,
  });

  const productMap = new Map<string, { views: number; carts: number }>();
  for (const row of productViews) {
    if (row.productId) productMap.set(row.productId, { views: row._count.productId, carts: 0 });
  }
  for (const row of addToCarts) {
    if (row.productId) {
      const existing = productMap.get(row.productId) || { views: 0, carts: 0 };
      existing.carts = row._count.productId;
      productMap.set(row.productId, existing);
    }
  }

  const productIds = Array.from(productMap.keys());
  const products = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, slug: true },
      })
    : [];
  const productNameMap = new Map(products.map((p) => [p.id, p]));

  return (
    <div>
      <h1 className="font-display text-3xl">Demand Signals</h1>
      <p className="mt-1 text-sm text-muted">Real customer intent from searches, Ask Atria, and product interest.</p>
      <div className="mt-4 flex gap-2 text-sm">
        {["7", "30", "90"].map((d) => (
          <a key={d} href={`/admin/demand-signals?range=${d}`} className="rounded-full border border-line bg-card px-3 py-1">
            {d} days
          </a>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="font-medium">Top searches</h2>
        <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-card text-sm">
          {searches.length === 0 ? (
            <li className="px-4 py-6 text-muted">No searches in this range.</li>
          ) : (
            searches.map((s, i) => (
              <li key={i} className="flex justify-between px-4 py-3">
                <span>{s.path}</span>
                <span className="text-muted">{s._count.path}</span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-medium">Ask Atria queries</h2>
        <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-card text-sm">
          {aiQueries.length === 0 ? (
            <li className="px-4 py-6 text-muted">No AI queries in this range.</li>
          ) : (
            aiQueries.map((s, i) => (
              <li key={i} className="flex justify-between px-4 py-3">
                <span>{s.path}</span>
                <span className="text-muted">{s._count.path}</span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-medium">Most viewed products</h2>
        <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-card text-sm">
          {productMap.size === 0 ? (
            <li className="px-4 py-6 text-muted">No product views in this range.</li>
          ) : (
            Array.from(productMap.entries()).map(([id, data]) => {
              const product = productNameMap.get(id);
              const name = product?.name ?? "Unknown";
              return (
                <li key={id} className="flex justify-between px-4 py-3">
                  <span>{name}</span>
                  <span className="text-muted">{data.views} views · {data.carts} carts</span>
                </li>
              );
            })
          )}
        </ul>
      </section>
    </div>
  );
}
