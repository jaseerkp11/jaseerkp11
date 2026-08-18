import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { getStoreSettings, whatsappUrl } from "@/lib/services/store-settings";

export const dynamic = "force-dynamic";

function digits(value: string) {
  return value.replace(/\D/g, "");
}

export default async function TrackDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ phone?: string }>;
}) {
  const { id } = await params;
  const { phone } = await searchParams;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, events: { orderBy: { createdAt: "asc" } } },
  });
  const last10 = digits(phone ?? "").slice(-10);
  if (!order || last10.length !== 10) notFound();
  const ok =
    digits(order.phone).endsWith(last10) || digits(order.shippingPhone).endsWith(last10);
  if (!ok) notFound();
  const settings = await getStoreSettings();
  const wa = whatsappUrl(settings.whatsapp, `Hi, I need help with order ${order.orderNumber}`);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-4xl">{order.orderNumber}</h1>
      <p className="mt-2 text-sm text-muted">
        {order.status.replaceAll("_", " ")} · {formatMoney(order.totalPaise)}
      </p>
      {order.trackingNumber ? (
        <p className="mt-3 text-sm">Courier tracking number: {order.trackingNumber}</p>
      ) : (
        <p className="mt-3 text-sm text-muted">Courier tracking is added after the parcel is packed.</p>
      )}
      <ul className="mt-6 space-y-2 text-sm">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between rounded-xl border border-line bg-card px-4 py-3">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>{formatMoney(item.unitPricePaise * item.quantity)}</span>
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
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        {wa ? (
          <Link href={wa} className="rounded-full bg-primary px-4 py-2 text-[#f6f1ea]" target="_blank" rel="noreferrer">
            Message on WhatsApp
          </Link>
        ) : null}
        <Link href="/pages/contact" className="rounded-full border border-line px-4 py-2">
          Contact form
        </Link>
      </div>
    </div>
  );
}
