import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account/orders");
  const orders = await prisma.order.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: "desc" },
  });
  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState title="No orders" description="Placed orders for this account will list here." action={{ href: "/products", label: "Shop" }} />
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-4xl">Orders</h1>
      <ul className="mt-6 space-y-3">
        {orders.map((order) => (
          <li key={order.id}>
            <Link href={`/account/orders/${order.id}`} className="flex items-center justify-between rounded-2xl border border-line bg-card px-4 py-4 text-sm">
              <span>{order.orderNumber}</span>
              <span>{order.status}</span>
              <span>{formatMoney(order.totalPaise)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
