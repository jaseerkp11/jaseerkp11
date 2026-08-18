import { redirect } from "next/navigation";
import { quoteCart } from "@/lib/services/cart";
import { getSessionUser } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  details: "Please fill name, email, address, city, and state.",
  phone: "Enter a 10-digit mobile number.",
  pincode: "Enter a valid 6-digit pincode.",
  stock: "One of the items does not have enough stock.",
  empty: "Your cart is empty.",
  save: "The order could not be saved. Please try again.",
  wait: "Please wait a moment and try again.",
  payment: "Please place the order with cash on delivery.",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const quote = await quoteCart();
  if (quote.activeItems.length === 0) redirect("/cart");
  const { error } = await searchParams;
  const user = await getSessionUser();
  const addresses = user
    ? await prisma.address.findMany({ where: { userId: user.id }, orderBy: { isDefault: "desc" } })
    : [];
  const message = error ? ERRORS[error] ?? ERRORS.save : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl">Checkout</h1>
      <p className="mt-2 text-sm text-muted">Pay cash when your order is delivered. Prices already include tax.</p>
      {message ? (
        <p className="mt-4 rounded-2xl border border-[#9b2c2c]/30 bg-[#f8ecec] px-4 py-3 text-sm text-[#9b2c2c]">{message}</p>
      ) : null}
      <form action="/api/checkout" method="post" className="mt-8 space-y-6">
        <input type="hidden" name="paymentMethod" value="cod" />
        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-medium">1. Customer</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              name="email"
              type="email"
              required
              defaultValue={user?.email}
              placeholder="Email"
              className="h-11 rounded-xl border border-line px-3 text-sm"
            />
            <input
              name="phone"
              type="tel"
              required
              inputMode="numeric"
              defaultValue={addresses[0]?.phone ?? ""}
              placeholder="10-digit mobile"
              className="h-11 rounded-xl border border-line px-3 text-sm"
            />
          </div>
        </section>
        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-medium">2. Address</h2>
          <div className="mt-4 grid gap-3">
            <input name="fullName" required defaultValue={addresses[0]?.fullName ?? user?.name} placeholder="Full name" className="h-11 rounded-xl border border-line px-3 text-sm" />
            <input name="addrPhone" type="tel" required defaultValue={addresses[0]?.phone ?? ""} placeholder="Delivery mobile" className="h-11 rounded-xl border border-line px-3 text-sm" />
            <input name="line1" required defaultValue={addresses[0]?.line1} placeholder="House / street" className="h-11 rounded-xl border border-line px-3 text-sm" />
            <input name="line2" defaultValue={addresses[0]?.line2 ?? ""} placeholder="Landmark (optional)" className="h-11 rounded-xl border border-line px-3 text-sm" />
            <div className="grid gap-3 sm:grid-cols-3">
              <input name="city" required defaultValue={addresses[0]?.city} placeholder="City" className="h-11 rounded-xl border border-line px-3 text-sm" />
              <input name="state" required defaultValue={addresses[0]?.state} placeholder="State" className="h-11 rounded-xl border border-line px-3 text-sm" />
              <input name="pincode" required inputMode="numeric" defaultValue={addresses[0]?.pincode} placeholder="Pincode" className="h-11 rounded-xl border border-line px-3 text-sm" />
            </div>
          </div>
        </section>
        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-medium">3. Delivery</h2>
          <div className="mt-4 space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" name="shippingMethod" value="standard" defaultChecked />
              Standard
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="shippingMethod" value="express" />
              Express
            </label>
          </div>
        </section>
        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-medium">4. Review</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {quote.activeItems.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>
                  {item.product.name} × {item.quantity}
                </span>
                <span>
                  {formatMoney((item.variant?.sellingPaise ?? item.product.sellingPaise) * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm font-semibold">Goods: {formatMoney(quote.totals.subtotalPaise)}</p>
          <p className="text-xs text-muted">Tax is already included in the price. Shipping is added using your pincode.</p>
        </section>
        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-medium">5. Payment</h2>
          <p className="mt-3 text-sm">
            <strong>Cash on delivery</strong>
            <span className="mt-1 block text-muted">Pay the delivery person when the parcel arrives.</span>
          </p>
        </section>
        <button className="h-12 w-full rounded-full bg-primary text-sm text-[#f6f1ea]">Place order</button>
      </form>
    </div>
  );
}
