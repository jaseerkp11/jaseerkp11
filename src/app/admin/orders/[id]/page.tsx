import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, events: { orderBy: { createdAt: "asc" } }, payments: true },
  });
  if (!order) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl">{order.orderNumber}</h1>
      <p className="mt-2 text-sm text-muted">
        {order.email} · {order.shippingCity} {order.shippingPincode}
      </p>
      <p className="mt-2 text-sm">
        Total {formatMoney(order.totalPaise)} · line cost snapshot {formatMoney(order.costPaise)} · goods profit after discount{" "}
        {formatMoney(order.subtotalPaise - order.discountPaise - order.costPaise)} (shipping/tax excluded)
      </p>
      <a href={`/admin/orders/${order.id}/invoice`} className="mt-4 inline-flex h-10 items-center rounded-full border border-line px-4 text-sm">
        Invoice / packing slip
      </a>
      <form action={`/api/admin/orders/${order.id}`} method="post" className="mt-6 grid max-w-lg gap-3 rounded-2xl border border-line bg-card p-5">
        <select name="status" defaultValue={order.status} className="h-11 rounded-xl border border-line px-3 text-sm">
          {[
            "PENDING",
            "CONFIRMED",
            "PROCESSING",
            "PACKED",
            "SHIPPED",
            "OUT_FOR_DELIVERY",
            "DELIVERED",
            "CANCELLED",
            "FAILED",
            "RETURN_REQUESTED",
            "RETURNED",
            "REFUNDED",
            "PARTIALLY_REFUNDED",
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <input name="trackingNumber" defaultValue={order.trackingNumber ?? ""} placeholder="Tracking number" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <input name="note" placeholder="Timeline note" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <button className="h-11 rounded-full bg-primary text-sm text-[#f6f1ea]">Update order</button>
      </form>
      <ul className="mt-6 space-y-2 text-sm">
        {order.items.map((item) => (
          <li key={item.id} className="rounded-xl border border-line bg-card px-4 py-3">
            {item.name} × {item.quantity} · sell {formatMoney(item.unitPricePaise)} · cost {formatMoney(item.unitCostPaise)}
          </li>
        ))}
      </ul>
      <ol className="mt-8 space-y-3">
        {order.events.map((event) => (
          <li key={event.id} className="border-l-2 border-primary pl-4 text-sm">
            <p className="font-medium">{event.status}</p>
            <p className="text-muted">{event.note}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
