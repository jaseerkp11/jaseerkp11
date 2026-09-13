"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-display text-4xl">Something went wrong</h1>
      <p className="mt-3 text-sm text-muted">The technical detail was logged on the server, not shown here.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-8 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm text-[#f6f1ea]"
      >
        Try again
      </button>
    </div>
  );
}
