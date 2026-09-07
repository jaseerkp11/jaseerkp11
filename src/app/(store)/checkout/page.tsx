import { redirect } from "next/navigation";
import { quoteCart } from "@/lib/services/cart";
import { getSessionUser } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { CheckoutForm } from "@/components/store/checkout-form";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const quote = await quoteCart();
  if (quote.activeItems.length === 0) redirect("/cart");
  const user = await getSessionUser();
  const addresses = user
    ? await prisma.address.findMany({ where: { userId: user.id }, orderBy: { isDefault: "desc" } })
    : [];
  const saved = addresses[0];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl">Checkout</h1>
      <p className="mt-2 text-sm text-muted">Pay cash when your order is delivered. Prices already include tax.</p>
      {error ? (
        <div className="mt-4 rounded-2xl border border-[#e3ddd4] bg-[#fff5f5] p-4 text-sm text-[#9b2c2c]">
          {error === "address" && "Please check your delivery address."}
          {error === "payment" && "Payment could not be processed. Please try again."}
          {error === "stock" && "Some items went out of stock. Please review your cart."}
          {error === "coupon" && "Coupon is no longer valid."}
          {!["address", "payment", "stock", "coupon"].includes(error) && "Something went wrong. Please try again."}
        </div>
      ) : null}
      <CheckoutForm
        defaults={{
          email: user?.email ?? "",
          phone: saved?.phone ?? "",
          fullName: saved?.fullName ?? user?.name ?? "",
          addrPhone: saved?.phone ?? "",
          line1: saved?.line1 ?? "",
          line2: saved?.line2 ?? "",
          city: saved?.city ?? "",
          state: saved?.state ?? "",
          pincode: saved?.pincode ?? "",
        }}
        items={quote.activeItems.map((item) => ({
          id: item.id,
          name: item.product.name,
          quantity: item.quantity,
          lineLabel: formatMoney((item.variant?.sellingPaise ?? item.product.sellingPaise) * item.quantity),
        }))}
        subtotalLabel={formatMoney(quote.totals.subtotalPaise)}
        deliveryLabel={formatMoney(quote.totals.shippingPaise)}
        totalLabel={formatMoney(quote.totals.totalPaise)}
      />
    </div>
  );
}
