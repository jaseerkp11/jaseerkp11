export const dynamic = "force-dynamic";

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl">Track order</h1>
      <p className="mt-3 text-sm text-muted">
        Enter the order number from your confirmation screen and the phone used at checkout.
      </p>
      {error ? <p className="mt-4 text-sm text-[#9b2c2c]">No matching order. Check the number and phone.</p> : null}
      <form action="/api/track" method="post" className="mt-8 grid gap-3">
        <input name="orderNumber" required placeholder="Order number" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <input name="phone" required placeholder="Phone" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <button className="h-11 rounded-full bg-primary text-sm text-[#f6f1ea]">Find order</button>
      </form>
    </div>
  );
}
