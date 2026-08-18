import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CategoriesAdminPage() {
  const categories = await prisma.category.findMany({
    include: { parent: true, _count: { select: { products: true } } },
    orderBy: { sortOrder: "asc" },
  });
  return (
    <div>
      <h1 className="font-display text-3xl">Categories</h1>
      <form action="/api/admin/categories" method="post" className="mt-6 grid max-w-xl gap-3 rounded-2xl border border-line bg-card p-5">
        <input name="name" required placeholder="Name" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <input name="slug" required placeholder="slug" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <textarea name="description" placeholder="Description" className="min-h-20 rounded-xl border border-line px-3 py-2 text-sm" />
        <select name="parentId" className="h-11 rounded-xl border border-line px-3 text-sm">
          <option value="">No parent</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button className="h-11 rounded-full bg-primary text-sm text-[#f6f1ea]">Create category</button>
      </form>
      <ul className="mt-8 divide-y divide-line rounded-2xl border border-line bg-card">
        {categories.map((c) => (
          <li key={c.id} className="flex justify-between px-4 py-3 text-sm">
            <span>
              {c.name} {c.parent ? `· child of ${c.parent.name}` : ""}
            </span>
            <span className="text-muted">{c._count.products} products</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
