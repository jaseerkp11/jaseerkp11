import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { getBrand } from "@/config/brand";
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
    include: { items: true },
  });
  if (!order) notFound();
  const brand = getBrand();
  const settings = await getStoreSettings();
  const wa = whatsappUrl(settings.whatsapp, `Hello ${brand.brandName}, I placed order ${order.orderNumber}`);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <p className="text-sm uppercase tracking-widest text-muted">Thank you</p>
      <h1 className="mt-2 font-display text-4xl">Your order is confirmed</h1>
      <p className="mt-4 text-sm leading-6 text-[#3f3a34]">
        Thank you for shopping with {brand.brandName}. We have received order{" "}
        <strong>{order.orderNumber}</strong> for {formatMoney(order.totalPaise)}. Please keep this amount ready in cash,
        including ₹80 delivery. We will pack your items and share tracking as soon as the parcel is with the courier.
      </p>
      <ul className="mt-8 space-y-2 rounded-2xl border border-line bg-card p-5 text-left text-sm">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>{formatMoney(item.unitPricePaise * item.quantity)}</span>
          </li>
        ))}
        <li className="flex justify-between border-t border-line pt-2">
          <span>Delivery</span>
          <span>{formatMoney(order.shippingPaise)}</span>
        </li>
        <li className="flex justify-between font-medium">
          <span>Total (COD)</span>
          <span>{formatMoney(order.totalPaise)}</span>
        </li>
      </ul>
      <p className="mt-6 text-sm text-muted">
        Delivering to {order.shippingName}, {order.shippingCity} {order.shippingPincode}.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/track" className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm text-[#f6f1ea]">
          Track this order
        </Link>
        {wa ? (
          <Link href={wa} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center rounded-full border border-line px-5 text-sm">
            WhatsApp us
          </Link>
        ) : null}
        <Link href="/products" className="inline-flex h-11 items-center rounded-full border border-line px-5 text-sm">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
