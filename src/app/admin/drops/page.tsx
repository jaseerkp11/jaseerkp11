import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDropsPage() {
  const drops = await prisma.banner.findMany({
    where: { placement: "atria-drop" },
    orderBy: { sortOrder: "asc" },
  });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Drops</h1>
        <a href="/admin/drops/new" className="rounded-full bg-primary px-4 py-2 text-sm text-[#f6f1ea]">
          New Drop
        </a>
      </div>
      <p className="mt-2 text-sm text-muted">
        Curated temporary events stored as banners with placement `atria-drop`.
      </p>
      <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-card">
        {drops.length === 0 ? (
          <li className="px-4 py-8 text-sm text-muted">No drops yet.</li>
        ) : (
          drops.map((d) => {
            const cfg = (() => {
              try {
                return JSON.parse(d.config);
              } catch {
                return {};
              }
            })();
            return (
              <li key={d.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{d.title}</p>
                  <p className="text-xs text-muted">
                    {d.subtitle} · {cfg.status ?? "DRAFT"} · {(cfg.productIds as string[])?.length ?? 0} products
                  </p>
                </div>
                <div className="flex gap-2">
                  <a href={`/admin/drops/${d.id}`} className="underline">
                    Edit
                  </a>
                  <form action={`/api/admin/drops/${d.id}`} method="post">
                    <input type="hidden" name="_method" value="DELETE" />
                    <button
                      type="submit"
                      className="text-[#9b2c2c]"
                      onClick={(e) => {
                        if (!confirm("Delete this drop?")) e.preventDefault();
                      }}
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
