import { redirect } from "next/navigation";
import { quoteCart } from "@/lib/services/cart";
import { getSessionUser } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { paymentProviders } from "@/lib/payments/provider";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const quote = await quoteCart();
  if (quote.activeItems.length === 0) redirect("/cart");
  const user = await getSessionUser();
  const addresses = user
    ? await prisma.address.findMany({ where: { userId: user.id }, orderBy: { isDefault: "desc" } })
    : [];
  const razorpay = await paymentProviders.razorpay.createIntent(0, "INR");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl">Checkout</h1>
      <p className="mt-2 text-sm text-muted">
        Totals are calculated on the server. Online UPI/card checkout needs a payment gateway. Cash on delivery is available now.
      </p>
      <form action="/api/checkout" method="post" className="mt-8 space-y-6">
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
              required
              placeholder="Phone"
              className="h-11 rounded-xl border border-line px-3 text-sm"
            />
          </div>
        </section>
        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-medium">2. Address</h2>
          {addresses.length > 0 ? (
            <p className="mt-2 text-xs text-muted">Saved addresses are shown for convenience. Confirm the fields below.</p>
          ) : null}
          <div className="mt-4 grid gap-3">
            <input name="fullName" required defaultValue={addresses[0]?.fullName ?? user?.name} placeholder="Full name" className="h-11 rounded-xl border border-line px-3 text-sm" />
            <input name="addrPhone" required defaultValue={addresses[0]?.phone} placeholder="Delivery phone" className="h-11 rounded-xl border border-line px-3 text-sm" />
            <input name="line1" required defaultValue={addresses[0]?.line1} placeholder="Address line 1" className="h-11 rounded-xl border border-line px-3 text-sm" />
            <input name="line2" defaultValue={addresses[0]?.line2 ?? ""} placeholder="Address line 2" className="h-11 rounded-xl border border-line px-3 text-sm" />
            <div className="grid gap-3 sm:grid-cols-3">
              <input name="city" required defaultValue={addresses[0]?.city} placeholder="City" className="h-11 rounded-xl border border-line px-3 text-sm" />
              <input name="state" required defaultValue={addresses[0]?.state} placeholder="State" className="h-11 rounded-xl border border-line px-3 text-sm" />
              <input name="pincode" required defaultValue={addresses[0]?.pincode} placeholder="Pincode" className="h-11 rounded-xl border border-line px-3 text-sm" />
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
          <p className="text-xs text-muted">Tax and shipping are recalculated when the order is placed.</p>
        </section>
        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-medium">5. Payment</h2>
          <div className="mt-4 space-y-3 text-sm">
            <label className="flex items-start gap-2 rounded-xl border border-line p-3">
              <input type="radio" name="paymentMethod" value="cod" defaultChecked />
              <span>
                <strong>Cash on delivery</strong>
                <span className="mt-1 block text-muted">
                  Order is created as unpaid. Staff must confirm collection on delivery. This is not a simulated success for cards or UPI.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-2 rounded-xl border border-line p-3">
              <input type="radio" name="paymentMethod" value="razorpay" disabled={!razorpay.configured} />
              <span>
                <strong>UPI / cards / net banking (Razorpay)</strong>
                <span className="mt-1 block text-muted">{razorpay.message}</span>
              </span>
            </label>
          </div>
        </section>
        <button className="h-12 w-full rounded-full bg-primary text-sm text-[#f6f1ea]">
          Place order
        </button>
      </form>
    </div>
  );
}
