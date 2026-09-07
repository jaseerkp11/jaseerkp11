import { prisma } from "@/lib/prisma";
import { CouponForm } from "@/components/admin/coupon-form";
import { AdminFilters } from "@/components/admin/filters-form";
import { Pagination } from "@/components/admin/pagination";

export const dynamic = "force-dynamic";

export default async function CouponsPage({
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
      { code: { contains: q } },
    ];
  }
  if (status === "active") {
    where.active = true;
  } else if (status === "inactive") {
    where.active = false;
  }
  const [coupons, total] = await Promise.all([
    prisma.coupon.findMany({
      where,
      include: { _count: { select: { redemptions: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.coupon.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div>
      <h1 className="font-display text-3xl">Coupons</h1>
      <CouponForm />
      <AdminFilters defaultQ={q ?? ""} defaultStatus={status ?? ""} />
      <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-card">
        {coupons.map((c) => (
          <li key={c.id} className="flex justify-between px-4 py-3 text-sm">
            <span>
              {c.code} · {c.type} {c.value}
            </span>
            <span className="text-muted">{c._count.redemptions} uses</span>
          </li>
        ))}
      </ul>
      <Pagination page={page} totalPages={totalPages} baseUrl="/admin/coupons" searchParams={{ q, status }} />
    </div>
  );
}
