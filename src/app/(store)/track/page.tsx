import { TrackForm } from "@/components/store/track-form";

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
      <TrackForm />
    </div>
  );
}
