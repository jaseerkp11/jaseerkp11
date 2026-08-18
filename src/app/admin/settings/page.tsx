import { getBrand } from "@/config/brand";
import { prisma } from "@/lib/prisma";
import { paymentProviders } from "@/lib/payments/provider";
import { emailProvider } from "@/lib/notifications/email";
import { ensureBusinessPages } from "@/lib/services/business-pages";
import { getStoreSettings } from "@/lib/services/store-settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await ensureBusinessPages();
  const brand = getBrand();
  const settings = await getStoreSettings();
  const razorpay = await paymentProviders.razorpay.createIntent(0, "INR");
  const [products, categories, policies, tickets] = await Promise.all([
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.category.count({ where: { status: "ACTIVE" } }),
    prisma.cmsPage.count(),
    prisma.supportTicket.count({ where: { status: "OPEN" } }),
  ]);
  const checks = [
    { ok: products > 0, label: `${products} active products` },
    { ok: categories > 0, label: `${categories} categories` },
    { ok: policies >= 8, label: "Policy pages ready (edit in Content)" },
    { ok: Boolean(settings.whatsapp), label: "WhatsApp number saved" },
    { ok: Boolean(settings.businessAddress), label: "Business address saved (for invoices)" },
    { ok: brand.supportEmail !== "hello@example.com", label: "Support email is not the example address" },
    { ok: razorpay.configured, label: "Razorpay (optional — COD works without it)" },
    { ok: emailProvider.configured, label: "Resend email (optional — orders still save without it)" },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-display text-3xl">Settings</h1>
      <p className="text-sm text-muted">
        Fill this page before you take real customer orders. Products can be added tomorrow. Cash on delivery already works.
      </p>
      <section className="rounded-2xl border border-line bg-card p-5 text-sm">
        <h2 className="font-medium">Launch checklist</h2>
        <ul className="mt-3 space-y-2">
          {checks.map((check) => (
            <li key={check.label} className="flex gap-2">
              <span>{check.ok ? "Yes" : "No"}</span>
              <span>{check.label}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-muted">Open support tickets: {tickets}. Change brand name and public URL in Vercel environment variables.</p>
      </section>
      <form action="/api/admin/settings" method="post" className="grid gap-3 rounded-2xl border border-line bg-card p-5">
        <h2 className="font-medium">Business details (shown on invoices)</h2>
        <input name="gstin" defaultValue={settings.gstin} placeholder="GSTIN (leave empty if unregistered)" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <input name="pan" defaultValue={settings.pan} placeholder="PAN (optional)" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <textarea name="businessAddress" defaultValue={settings.businessAddress} placeholder="Registered / billing address" className="min-h-24 rounded-xl border border-line px-3 py-2 text-sm" />
        <textarea name="warehouseAddress" defaultValue={settings.warehouseAddress} placeholder="Pack-from / warehouse address" className="min-h-20 rounded-xl border border-line px-3 py-2 text-sm" />
        <input name="whatsapp" defaultValue={settings.whatsapp} placeholder="WhatsApp number e.g. 9876543210" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <textarea name="invoiceNote" defaultValue={settings.invoiceNote} placeholder="Note printed on invoices" className="min-h-20 rounded-xl border border-line px-3 py-2 text-sm" />
        <h2 className="mt-4 font-medium">Shipping fees (₹)</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            Free standard over
            <input name="freeShippingRupees" defaultValue={settings.freeShippingRupees} className="mt-1 h-11 w-full rounded-xl border border-line px-3" />
          </label>
          <label className="text-sm">
            Standard fee
            <input name="standardShippingRupees" defaultValue={settings.standardShippingRupees} className="mt-1 h-11 w-full rounded-xl border border-line px-3" />
          </label>
          <label className="text-sm">
            Express fee
            <input name="expressShippingRupees" defaultValue={settings.expressShippingRupees} className="mt-1 h-11 w-full rounded-xl border border-line px-3" />
          </label>
        </div>
        <button className="mt-2 h-11 rounded-full bg-primary text-sm text-[#f6f1ea]">Save business settings</button>
      </form>
      <section className="rounded-2xl border border-line bg-card p-5 text-sm">
        <h2 className="font-medium">Brand (Vercel environment)</h2>
        <dl className="mt-3 space-y-1">
          <div className="flex justify-between gap-4">
            <dt>Name</dt>
            <dd>{brand.brandName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Site URL</dt>
            <dd className="truncate">{brand.siteUrl}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Support email</dt>
            <dd>{brand.supportEmail}</dd>
          </div>
        </dl>
        <p className="mt-3 text-muted">
          Razorpay: {razorpay.configured ? "keys present" : "not connected — use COD"}. Email:{" "}
          {emailProvider.configured ? "Resend key present" : "not connected"}.
        </p>
      </section>
    </div>
  );
}
