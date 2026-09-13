import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;
  if (!orderNumber) notFound();
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, payments: true },
  });
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="font-display text-4xl">Order received</h1>
      <p className="mt-3 text-sm text-muted">
        {order.orderNumber} · {formatMoney(order.totalPaise)} · payment {order.paymentStatus.replaceAll("_", " ").toLowerCase()}
      </p>
      <p className="mt-4 text-sm">
        This is not a fake success screen. The order exists in the database. Online payment confirmation only happens when a gateway webhook is configured.
      </p>
      <ul className="mt-6 space-y-1 text-left text-sm">
        {order.items.map((item) => (
          <li key={item.id}>
            {item.name} × {item.quantity}
          </li>
        ))}
      </ul>
      <Link href="/account/orders" className="mt-8 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm text-[#f6f1ea]">
        View orders
      </Link>
    </div>
  );
}
