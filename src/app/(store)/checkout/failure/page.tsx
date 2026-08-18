import Link from "next/link";

export default function CheckoutFailurePage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="font-display text-4xl">Checkout could not finish</h1>
      <p className="mt-3 text-sm text-muted">
        The order was not marked paid. If a payment provider is not configured, use cash on delivery or add gateway keys.
      </p>
      <Link href="/checkout" className="mt-8 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm text-[#f6f1ea]">
        Return to checkout
      </Link>
    </div>
  );
}
