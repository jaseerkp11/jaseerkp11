import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { getStoreSettings, whatsappUrl } from "@/lib/services/store-settings";

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
  const settings = await getStoreSettings();
  const wa = whatsappUrl(settings.whatsapp, `Hi, I just placed order ${order.orderNumber}`);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="font-display text-4xl">Order received</h1>
      <p className="mt-3 text-sm text-muted">
        {order.orderNumber} · {formatMoney(order.totalPaise)} · payment {order.paymentStatus.replaceAll("_", " ").toLowerCase()}
      </p>
      <p className="mt-4 text-sm">
        Save this order number. For cash on delivery, keep the exact amount ready. We will pack the order and add tracking in your Track order page.
      </p>
      <ul className="mt-6 space-y-1 text-left text-sm">
        {order.items.map((item) => (
          <li key={item.id}>
            {item.name} × {item.quantity}
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={`/track`} className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm text-[#f6f1ea]">
          Track order
        </Link>
        {wa ? (
          <Link href={wa} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center rounded-full border border-line px-5 text-sm">
            WhatsApp us
          </Link>
        ) : null}
        <Link href="/account/orders" className="inline-flex h-11 items-center rounded-full border border-line px-5 text-sm">
          Account
        </Link>
      </div>
    </div>
  );
}
