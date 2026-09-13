import { notFound, redirect } from "next/navigation";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, events: { orderBy: { createdAt: "asc" } }, payments: true },
  });
  if (!order) notFound();
  if (order.customerId !== user.id && !isStaff(user.role)) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-4xl">{order.orderNumber}</h1>
      <p className="mt-2 text-sm text-muted">
        {order.status} · payment {order.paymentStatus} · {formatMoney(order.totalPaise)}
      </p>
      <ul className="mt-6 space-y-2 text-sm">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between rounded-xl border border-line bg-card px-4 py-3">
            <span>
              {item.name} {item.variantLabel ? `(${item.variantLabel})` : ""} × {item.quantity}
            </span>
            <span>{formatMoney(item.unitPricePaise * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <section className="mt-8">
        <h2 className="font-display text-2xl">Timeline</h2>
        <ol className="mt-4 space-y-3">
          {order.events.map((event) => (
            <li key={event.id} className="border-l-2 border-primary pl-4 text-sm">
              <p className="font-medium">{event.status}</p>
              <p className="text-muted">{event.note}</p>
              <p className="text-xs text-muted">{event.createdAt.toLocaleString("en-IN")}</p>
            </li>
          ))}
        </ol>
      </section>
      {order.trackingNumber ? (
        <p className="mt-6 text-sm">Tracking number stored: {order.trackingNumber}. Live carrier tracking is not connected.</p>
      ) : (
        <p className="mt-6 text-sm text-muted">No tracking number yet.</p>
      )}
    </div>
  );
}
