import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminFindsPage() {
  const finds = await prisma.banner.findMany({
    where: { placement: "atria-find" },
    orderBy: { sortOrder: "asc" },
  });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Finds</h1>
        <a href="/admin/finds/new" className="rounded-full bg-primary px-4 py-2 text-sm text-[#f6f1ea]">
          New Find
        </a>
      </div>
      <p className="mt-2 text-sm text-muted">Permanent discovery collections stored as banners with placement `atria-find`.</p>
      <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-card">
        {finds.length === 0 ? (
          <li className="px-4 py-8 text-sm text-muted">No finds yet.</li>
        ) : (
          finds.map((f) => {
            const cfg = (() => {
              try {
                return JSON.parse(f.config);
              } catch {
                return {};
              }
            })();
            return (
              <li key={f.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{f.title}</p>
                  <p className="text-xs text-muted">
                    {f.subtitle} · {(cfg.productIds as string[])?.length ?? 0} products
                  </p>
                </div>
                <div className="flex gap-2">
                  <a href={`/admin/finds/${f.id}`} className="underline">
                    Edit
                  </a>
                  <form action={`/api/admin/finds/${f.id}`} method="post">
                    <input type="hidden" name="_method" value="DELETE" />
                    <button
                      type="submit"
                      className="text-[#9b2c2c]"
                      onClick={(e) => {
                        if (!confirm("Delete this find?")) e.preventDefault();
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
