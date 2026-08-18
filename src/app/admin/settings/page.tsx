import { getBrand } from "@/config/brand";
import { paymentProviders } from "@/lib/payments/provider";
import { emailProvider } from "@/lib/notifications/email";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const brand = getBrand();
  const razorpay = await paymentProviders.razorpay.createIntent(0, "INR");
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-3xl">Settings</h1>
      <section className="rounded-2xl border border-line bg-card p-5 text-sm">
        <h2 className="font-medium">Brand (environment)</h2>
        <dl className="mt-3 space-y-1">
          <div className="flex justify-between">
            <dt>Name</dt>
            <dd>{brand.brandName}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Site URL</dt>
            <dd className="truncate pl-4">{brand.siteUrl}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Currency</dt>
            <dd>{brand.currency}</dd>
          </div>
        </dl>
        <p className="mt-3 text-muted">Change these with NEXT_PUBLIC_* variables. Do not hard-code a Vercel URL.</p>
      </section>
      <section className="rounded-2xl border border-line bg-card p-5 text-sm">
        <h2 className="font-medium">Integrations</h2>
        <ul className="mt-3 space-y-2">
          <li>Razorpay: {razorpay.configured ? "keys present" : razorpay.message}</li>
          <li>Email: {emailProvider.configured ? "transport variables present" : "not configured"}</li>
          <li>Shipping carriers: table-based quotes only</li>
        </ul>
      </section>
    </div>
  );
}
