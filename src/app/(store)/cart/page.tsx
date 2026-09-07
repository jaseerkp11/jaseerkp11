import Link from "next/link";
import { quoteCart } from "@/lib/services/cart";
import { formatMoney } from "@/lib/money";
import { getBrand } from "@/config/brand";
import { EmptyState } from "@/components/ui/empty-state";
import { CartItemUpdateForm, CartItemRemoveForm } from "@/components/cart/cart-item-form";
import { CouponForm } from "@/components/cart/coupon-form";

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
                  <CartItemUpdateForm itemId={item.id} quantity={item.quantity} />
                  <CartItemRemoveForm itemId={item.id} />
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
              <dt>Delivery</dt>
              <dd>{formatMoney(totals.shippingPaise)}</dd>
            </div>
            <div className="flex justify-between font-semibold">
              <dt>Total</dt>
              <dd>{formatMoney(totals.totalPaise)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-muted">Prices include tax. Delivery is ₹80 on every order.</p>
          <CouponForm defaultValue={cart.couponCode ?? ""} />
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
