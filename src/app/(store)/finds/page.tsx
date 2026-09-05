import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FindsPage() {
  const sections = await prisma.homepageSection.findMany({
    where: { key: { startsWith: "find-" }, enabled: true },
    orderBy: { sortOrder: "asc" },
  });
  return (
    <div>
      <h1 className="font-display text-3xl">Finds</h1>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {sections.length === 0 ? (
          <li className="text-sm text-muted">No live finds yet.</li>
        ) : (
          sections.map((s) => {
            const cfg = (() => {
              try {
                return JSON.parse(s.config);
              } catch {
                return {};
              }
            })();
            const productIds = (cfg.productIds as string[]) ?? [];
            return (
              <li key={s.id} className="rounded-2xl border border-line bg-card p-4">
                <p className="font-medium">{s.title}</p>
                <p className="text-xs text-muted">{(cfg.subtitle as string) ?? ""}</p>
                <p className="mt-1 text-xs text-muted">{productIds.length} products</p>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
