import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { EmptyState } from "@/components/ui/empty-state";
import type { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const where = status ? { status: status as OrderStatus } : undefined;
  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    <div>
      <h1 className="font-display text-3xl">Orders</h1>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        {["", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "RETURNED", "REFUNDED"].map((s) => (
          <Link
            key={s || "all"}
            href={s ? `/admin/orders?status=${s}` : "/admin/orders"}
            className="rounded-full border border-line bg-card px-3 py-1"
          >
            {s || "All"}
          </Link>
        ))}
      </div>
      {orders.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No orders" description="Orders appear after a real checkout." />
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-card">
          {orders.map((order) => (
            <li key={order.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <Link href={`/admin/orders/${order.id}`} className="underline">
                {order.orderNumber}
              </Link>
              <span>{order.status}</span>
              <span>{order.paymentStatus}</span>
              <span>{formatMoney(order.totalPaise)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
