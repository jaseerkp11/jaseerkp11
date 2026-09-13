import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  const orders = await prisma.order.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  const wishlistCount = await prisma.wishlistItem.count({ where: { userId: user.id } });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl">Hello, {user.name}</h1>
      <p className="mt-2 text-sm text-muted">{user.email} · {user.role.toLowerCase()}</p>
      <nav className="mt-6 flex flex-wrap gap-3 text-sm">
        {[
          ["/account", "Dashboard"],
          ["/account/orders", "Orders"],
          ["/account/addresses", "Addresses"],
          ["/account/wishlist", "Wishlist"],
          ["/account/settings", "Security"],
          ["/pages/contact", "Support"],
        ].map(([href, label]) => (
          <Link key={href} href={href} className="rounded-full border border-line bg-card px-4 py-2">
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="text-xs text-muted">Orders</p>
          <p className="mt-2 font-display text-3xl">{orders.length}</p>
        </div>
        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="text-xs text-muted">Wishlist</p>
          <p className="mt-2 font-display text-3xl">{wishlistCount}</p>
        </div>
        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="text-xs text-muted">Latest total</p>
          <p className="mt-2 font-display text-3xl">
            {orders[0] ? formatMoney(orders[0].totalPaise) : "—"}
          </p>
        </div>
      </div>
      <section className="mt-10">
        <h2 className="font-display text-2xl">Recent orders</h2>
        {orders.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No orders yet" description="When you place an order it will appear here." action={{ href: "/products", label: "Shop" }} />
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-card">
            {orders.map((order) => (
              <li key={order.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <Link href={`/account/orders/${order.id}`} className="underline">
                  {order.orderNumber}
                </Link>
                <span>{order.status}</span>
                <span>{formatMoney(order.totalPaise)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <form action="/api/auth/logout" method="post" className="mt-8">
        <button className="text-sm underline">Sign out</button>
      </form>
    </div>
  );
}
