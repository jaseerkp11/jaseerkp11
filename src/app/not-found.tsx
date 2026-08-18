import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-display text-5xl">Page not found</h1>
      <p className="mt-3 text-sm text-muted">That URL is not in this store.</p>
      <Link href="/" className="mt-8 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm text-[#f6f1ea]">
        Home
      </Link>
    </div>
  );
}
