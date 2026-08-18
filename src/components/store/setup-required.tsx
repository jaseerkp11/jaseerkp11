import Link from "next/link";
import { getBrand } from "@/config/brand";

export function SetupRequired() {
  const brand = getBrand();
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-display text-4xl">{brand.brandName}</h1>
      <p className="mt-4 text-sm text-muted">
        The database is not available. For local development run <code>npm run db:setup</code>. On
        Vercel, add a hosted <code>DATABASE_URL</code> (Neon or Turso) so orders and inventory can persist.
      </p>
      <Link href="/" className="mt-8 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm text-[#f6f1ea]">
        Retry
      </Link>
    </div>
  );
}
