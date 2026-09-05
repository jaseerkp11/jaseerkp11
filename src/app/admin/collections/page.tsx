import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage() {
  const collections = await prisma.banner.findMany({
    where: { placement: "atria-collection" },
    orderBy: { sortOrder: "asc" },
  });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Collections</h1>
        <a href="/admin/collections/new" className="rounded-full bg-primary px-4 py-2 text-sm text-[#f6f1ea]">
          New Collection
        </a>
      </div>
      <p className="mt-2 text-sm text-muted">Flexible product groupings stored as banners with placement `atria-collection`.</p>
      <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-card">
        {collections.length === 0 ? (
          <li className="px-4 py-8 text-sm text-muted">No collections yet.</li>
        ) : (
          collections.map((c) => {
            const cfg = (() => {
              try {
                return JSON.parse(c.config);
              } catch {
                return {};
              }
            })();
            return (
              <li key={c.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{c.title}</p>
                  <p className="text-xs text-muted">
                    {c.subtitle} · {(cfg.productIds as string[])?.length ?? 0} products
                  </p>
                </div>
                <div className="flex gap-2">
                  <a href={`/admin/collections/${c.id}`} className="underline">
                    Edit
                  </a>
                  <form action={`/api/admin/collections/${c.id}`} method="post">
                    <input type="hidden" name="_method" value="DELETE" />
                    <button
                      type="submit"
                      className="text-[#9b2c2c]"
                      onClick={(e) => {
                        if (!confirm("Delete this collection?")) e.preventDefault();
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
