import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditDropPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const section = await prisma.homepageSection.findUnique({ where: { id } });
  if (!section) notFound();
  const cfg = (() => {
    try {
      return JSON.parse(section.config);
    } catch {
      return {};
    }
  })();
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, sku: true },
  });
  const selectedIds = new Set((cfg.productIds as string[]) ?? []);
  return (
    <div>
      <h1 className="font-display text-3xl">Edit Drop</h1>
      <form action={`/api/admin/drops/${id}`} method="post" className="mt-6 grid max-w-3xl gap-4 rounded-2xl border border-line bg-card p-5">
        <input name="name" required defaultValue={section.title} placeholder="Drop name" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <input name="slug" required defaultValue={cfg.slug ?? ""} placeholder="slug" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <textarea name="shortDescription" defaultValue={(cfg.subtitle as string) ?? ""} placeholder="Short description" className="min-h-20 rounded-xl border border-line px-3 py-2 text-sm" />
        <textarea name="description" defaultValue={""} placeholder="Full description" className="min-h-32 rounded-xl border border-line px-3 py-2 text-sm" />
        <input name="coverImage" defaultValue={(cfg.imageUrl as string) ?? ""} placeholder="Cover image URL" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            Start at
            <input name="startAt" type="datetime-local" defaultValue={cfg.startAt ?? ""} className="mt-1 h-11 w-full rounded-xl border border-line px-3" />
          </label>
          <label className="text-sm">
            End at
            <input name="endAt" type="datetime-local" defaultValue={cfg.endAt ?? ""} className="mt-1 h-11 w-full rounded-xl border border-line px-3" />
          </label>
        </div>
        <select name="status" defaultValue={cfg.status ?? "DRAFT"} className="h-11 rounded-xl border border-line px-3 text-sm">
          <option>DRAFT</option>
          <option>SCHEDULED</option>
          <option>LIVE</option>
          <option>ENDED</option>
          <option>ARCHIVED</option>
        </select>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Products</legend>
          <p className="text-xs text-muted">Select products to include in this drop.</p>
          <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-line p-3">
            {products.map((p) => (
              <label key={p.id} className="flex items-center gap-2 py-1 text-sm">
                <input type="checkbox" name="productIds" value={p.id} defaultChecked={selectedIds.has(p.id)} />
                <span>{p.name}</span>
                <span className="text-xs text-muted">{p.sku}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <button className="h-11 rounded-full bg-primary text-sm text-[#f6f1ea]">Save drop</button>
      </form>
    </div>
  );
}
