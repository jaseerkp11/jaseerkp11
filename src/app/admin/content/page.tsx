import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const announcement = await prisma.siteSetting.findUnique({ where: { id: "announcement" } });
  const pages = await prisma.cmsPage.findMany({ orderBy: { slug: "asc" } });
  const banners = await prisma.banner.findMany({ orderBy: { sortOrder: "asc" } });
  const sections = await prisma.homepageSection.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div className="space-y-10">
      <h1 className="font-display text-3xl">Content</h1>
      <form action="/api/admin/content" method="post" className="grid max-w-2xl gap-3 rounded-2xl border border-line bg-card p-5">
        <label className="text-sm">
          Announcement bar
          <input name="announcement" defaultValue={announcement?.value ?? ""} className="mt-1 h-11 w-full rounded-xl border border-line px-3" />
        </label>
        <p className="text-xs text-muted">To edit a policy page, choose it and save. Banner image URLs are stored on Banner records.</p>
        {pages.map((page) => (
          <details key={page.id} className="rounded-xl border border-line p-3">
            <summary className="cursor-pointer text-sm font-medium">{page.title}</summary>
            <input type="hidden" name="pageId" value={page.id} />
            <input name="title" defaultValue={page.title} className="mt-3 h-11 w-full rounded-xl border border-line px-3 text-sm" />
            <textarea name="body" defaultValue={page.body} className="mt-2 min-h-32 w-full rounded-xl border border-line px-3 py-2 text-sm" />
          </details>
        ))}
        <button className="h-11 rounded-full bg-primary text-sm text-[#f6f1ea]">Save content</button>
      </form>
      <section>
        <h2 className="font-medium">Homepage sections</h2>
        <ul className="mt-3 text-sm">
          {sections.map((s) => (
            <li key={s.id}>
              {s.sortOrder}. {s.title} — {s.enabled ? "on" : "off"}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="font-medium">Banners</h2>
        <ul className="mt-3 text-sm">
          {banners.map((b) => (
            <li key={b.id}>
              {b.placement}: {b.title} ({b.imageUrl})
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
