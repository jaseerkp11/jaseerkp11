import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { EmptyState } from "@/components/ui/empty-state";
import { AdminFilters } from "@/components/admin/filters-form";
import { Pagination } from "@/components/admin/pagination";
import type { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { q, status, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1"));
  const pageSize = 20;
  const where: Record<string, unknown> = {};
  if (status && ["PENDING", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "FAILED", "RETURN_REQUESTED", "RETURNED", "REFUNDED", "PARTIALLY_REFUNDED"].includes(status)) {
    where.status = status as OrderStatus;
  }
  if (q) {
    where.OR = [
      { orderNumber: { contains: q } },
      { email: { contains: q } },
    ];
  }
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div>
      <h1 className="font-display text-3xl">Orders</h1>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        {["", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "RETURNED", "REFUNDED"].map((s) => (
          <Link
            key={s || "all"}
            href={s ? `/admin/orders?status=${s}` : "/admin/orders"}
            className={`rounded-full border px-3 py-1 ${status === s || (!s && !status) ? "border-primary bg-primary text-[#f6f1ea]" : "border-line bg-card"}`}
          >
            {s || "All"}
          </Link>
        ))}
      </div>
      <AdminFilters defaultQ={q ?? ""} />
      {orders.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No orders" description="Orders appear after a real checkout." />
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-card">
          {orders.map((order) => (
            <li key={order.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
              <div className="flex items-center gap-3">
                <Link href={`/admin/orders/${order.id}`} className="underline">
                  {order.orderNumber}
                </Link>
                <span>{order.status}</span>
                <span>{order.paymentStatus}</span>
                <span>{formatMoney(order.totalPaise)}</span>
              </div>
              <form action={`/api/admin/orders/${order.id}`} method="post" onSubmit={(event) => { if (!confirm("Delete this order?")) event.preventDefault(); }}>
                <input type="hidden" name="_method" value="DELETE" />
                <button type="submit" className="text-xs text-red-600 hover:text-red-700">Delete</button>
              </form>
            </li>
          ))}
        </ul>
      )}
      <Pagination page={page} totalPages={totalPages} baseUrl="/admin/orders" searchParams={{ q, status }} />
    </div>
  );
}
