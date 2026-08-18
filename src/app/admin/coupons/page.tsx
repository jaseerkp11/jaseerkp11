import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CouponsPage() {
  const coupons = await prisma.coupon.findMany({ include: { _count: { select: { redemptions: true } } } });
  return (
    <div>
      <h1 className="font-display text-3xl">Coupons</h1>
      <form action="/api/admin/coupons" method="post" className="mt-6 grid max-w-xl gap-3 rounded-2xl border border-line bg-card p-5">
        <input name="code" required placeholder="CODE" className="h-11 rounded-xl border border-line px-3 text-sm uppercase" />
        <select name="type" className="h-11 rounded-xl border border-line px-3 text-sm">
          <option value="PERCENTAGE">Percentage</option>
          <option value="FIXED">Fixed ₹</option>
        </select>
        <input name="value" type="number" required placeholder="Value (percent or rupees)" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <input name="minOrder" type="number" placeholder="Minimum order ₹" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <input name="usageLimit" type="number" placeholder="Usage limit" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <button className="h-11 rounded-full bg-primary text-sm text-[#f6f1ea]">Create coupon</button>
      </form>
      <ul className="mt-8 divide-y divide-line rounded-2xl border border-line bg-card">
        {coupons.map((c) => (
          <li key={c.id} className="flex justify-between px-4 py-3 text-sm">
            <span>
              {c.code} · {c.type} {c.value}
            </span>
            <span className="text-muted">{c._count.redemptions} uses</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
