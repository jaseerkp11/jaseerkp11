import Link from "next/link";
import { quoteCart } from "@/lib/services/cart";
import { formatMoney } from "@/lib/money";
import { getBrand } from "@/config/brand";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const brand = getBrand();
  const quote = await quoteCart();
  const { activeItems, totals, cart, couponMessage } = quote;

  if (activeItems.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title="Your cart is empty"
          description="Add something from the catalogue. Guest carts are stored in a cookie until you sign in."
          action={{ href: "/products", label: "Continue shopping" }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl">Cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <ul className="space-y-4">
          {activeItems.map((item) => {
            const price = item.variant?.sellingPaise ?? item.product.sellingPaise;
            return (
              <li key={item.id} className="flex gap-4 rounded-2xl border border-line bg-card p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.product.images[0]?.url}
                  alt=""
                  className="h-24 w-20 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium">{item.product.name}</p>
                  {item.variant ? <p className="text-xs text-muted">{item.variant.name}</p> : null}
                  <p className="mt-1 text-sm">
                    {formatMoney(price, brand.currency, brand.currencySymbol)}
                  </p>
                  <form action="/api/cart/update" method="post" className="mt-2 flex items-center gap-2">
                    <input type="hidden" name="itemId" value={item.id} />
                    <input
                      name="quantity"
                      type="number"
                      min={1}
                      max={20}
                      defaultValue={item.quantity}
                      className="h-9 w-16 rounded-lg border border-line px-2 text-sm"
                    />
                    <button className="text-sm underline">Update</button>
                  </form>
                  <form action="/api/cart/remove" method="post">
                    <input type="hidden" name="itemId" value={item.id} />
                    <button className="mt-1 text-xs text-muted underline">Remove</button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
        <aside className="h-fit rounded-2xl border border-line bg-card p-5">
          <h2 className="font-medium">Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatMoney(totals.subtotalPaise)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Discount</dt>
              <dd>-{formatMoney(totals.discountPaise)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Estimated tax</dt>
              <dd>{formatMoney(totals.taxPaise)}</dd>
            </div>
            <div className="flex justify-between font-semibold">
              <dt>Total</dt>
              <dd>{formatMoney(totals.totalPaise)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-muted">Shipping is calculated after you enter a pincode at checkout.</p>
          <form action="/api/cart/coupon" method="post" className="mt-4 space-y-2">
            <input
              name="code"
              defaultValue={cart.couponCode ?? ""}
              placeholder="Coupon code"
              className="h-11 w-full rounded-xl border border-line px-3 text-sm uppercase"
            />
            <button className="h-10 w-full rounded-full border border-line text-sm">Apply coupon</button>
          </form>
          {couponMessage ? <p className="mt-2 text-xs text-[#9b2c2c]">{couponMessage}</p> : null}
          {cart.couponCode && !couponMessage ? (
            <p className="mt-2 text-xs text-[#2f6b4f]">Coupon {cart.couponCode} applied.</p>
          ) : null}
          <Link
            href="/checkout"
            className="mt-5 flex h-12 items-center justify-center rounded-full bg-primary text-sm text-[#f6f1ea]"
          >
            Checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}
