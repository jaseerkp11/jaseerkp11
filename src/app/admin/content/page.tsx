import { prisma } from "@/lib/prisma";
import { ensureBusinessPages } from "@/lib/services/business-pages";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  await ensureBusinessPages();
  const announcement = await prisma.siteSetting.findUnique({ where: { id: "announcement" } });
  const pages = await prisma.cmsPage.findMany({ orderBy: { slug: "asc" } });
  const banners = await prisma.banner.findMany({ orderBy: { sortOrder: "asc" } });
  const sections = await prisma.homepageSection.findMany({ orderBy: { sortOrder: "asc" } });
  const faqs = await prisma.faq.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div className="space-y-10">
      <h1 className="font-display text-3xl">Content</h1>
      <p className="text-sm text-muted">
        Edit customer-facing pages here. Save writes every policy on this screen.
      </p>
      <form action="/api/admin/content" method="post" className="grid max-w-2xl gap-3 rounded-2xl border border-line bg-card p-5">
        <label className="text-sm">
          Announcement bar
          <input name="announcement" defaultValue={announcement?.value ?? ""} className="mt-1 h-11 w-full rounded-xl border border-line px-3" />
        </label>
        {pages.map((page) => (
          <details key={page.id} className="rounded-xl border border-line p-3">
            <summary className="flex cursor-pointer items-center justify-between text-sm font-medium">
              <span>{page.title} ({page.slug})</span>
              <form action={`/api/admin/content/${page.id}`} method="post" onSubmit={(event) => { if (!confirm("Delete this page?")) event.preventDefault(); }} className="inline">
                <input type="hidden" name="_method" value="DELETE" />
                <button type="submit" className="text-xs text-red-600 hover:text-red-700">Delete</button>
              </form>
            </summary>
            <input name={`title_${page.id}`} defaultValue={page.title} className="mt-3 h-11 w-full rounded-xl border border-line px-3 text-sm" />
            <textarea name={`body_${page.id}`} defaultValue={page.body} className="mt-2 min-h-32 w-full rounded-xl border border-line px-3 py-2 text-sm" />
          </details>
        ))}
        <h2 className="mt-2 font-medium">FAQ</h2>
        {faqs.map((faq) => (
          <div key={faq.id} className="rounded-xl border border-line p-3">
            <input name={`faqQuestion_${faq.id}`} defaultValue={faq.question} className="h-11 w-full rounded-xl border border-line px-3 text-sm" />
            <textarea name={`faqAnswer_${faq.id}`} defaultValue={faq.answer} className="mt-2 min-h-20 w-full rounded-xl border border-line px-3 py-2 text-sm" />
          </div>
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
            <li key={b.id} className="flex items-center justify-between gap-2">
              <span>{b.placement}: {b.title} ({b.imageUrl})</span>
              <form action={`/api/admin/content/${b.id}`} method="post" onSubmit={(event) => { if (!confirm("Delete this banner?")) event.preventDefault(); }}>
                <input type="hidden" name="_method" value="DELETE" />
                <button type="submit" className="text-xs text-red-600 hover:text-red-700">Delete</button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
