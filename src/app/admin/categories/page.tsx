import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/admin/category-form";
import { AdminFilters } from "@/components/admin/filters-form";
import { Pagination } from "@/components/admin/pagination";

export const dynamic = "force-dynamic";

export default async function CategoriesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { q, status, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1"));
  const pageSize = 20;
  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { slug: { contains: q } },
    ];
  }
  if (status && ["ACTIVE", "INACTIVE", "ARCHIVED"].includes(status)) {
    where.status = status;
  }
  const [categories, parents, total] = await Promise.all([
    prisma.category.findMany({
      where,
      include: { parent: true, _count: { select: { products: true } } },
      orderBy: { sortOrder: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.category.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div>
      <h1 className="font-display text-3xl">Categories</h1>
      <CategoryForm parents={parents} />
      <AdminFilters defaultQ={q ?? ""} defaultStatus={status ?? ""} />
      <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-card">
        {categories.map((c) => (
          <li key={c.id} className="flex justify-between px-4 py-3 text-sm">
            <span>
              {c.name} {c.parent ? `· child of ${c.parent.name}` : ""}
            </span>
            <span className="text-muted">{c._count.products} products</span>
          </li>
        ))}
      </ul>
      <Pagination page={page} totalPages={totalPages} baseUrl="/admin/categories" searchParams={{ q, status }} />
    </div>
  );
}
