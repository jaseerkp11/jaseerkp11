import Link from "next/link";
import { getBrand } from "@/config/brand";
import { getStoreSettings, whatsappUrl } from "@/lib/services/store-settings";

export async function Footer({
  categories,
}: {
  categories: Array<{ name: string; slug: string }>;
}) {
  const brand = getBrand();
  const settings = await getStoreSettings();
  const wa = whatsappUrl(settings.whatsapp);
  return (
    <footer className="mt-auto border-t border-line bg-[#efe8de]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div>
          <p className="font-display text-2xl">{brand.brandName}</p>
          <p className="mt-3 max-w-xs text-sm text-muted">{brand.tagline}</p>
          {settings.gstin ? <p className="mt-3 text-xs text-muted">GSTIN {settings.gstin}</p> : null}
        </div>
        <div>
          <p className="text-sm font-semibold">Shop</p>
          <ul className="mt-3 space-y-2 text-sm">
            {categories.slice(0, 8).map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`}>{c.name}</Link>
              </li>
            ))}
            <li>
              <Link href="/drops">Drops</Link>
            </li>
            <li>
              <Link href="/finds">Finds</Link>
            </li>
            <li>
              <Link href="/collections">Collections</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Help</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/track">Track order</Link>
            </li>
            <li>
              <Link href="/faq">FAQ</Link>
            </li>
            <li>
              <Link href="/pages/contact">Contact</Link>
            </li>
            {wa ? (
              <li>
                <Link href={wa} target="_blank" rel="noreferrer">
                  WhatsApp
                </Link>
              </li>
            ) : null}
            <li>
              <Link href="/pages/shipping-policy">Shipping</Link>
            </li>
            <li>
              <Link href="/pages/return-policy">Returns</Link>
            </li>
            <li>
              <Link href="/pages/refund-policy">Refunds</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Company</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/pages/about">About</Link>
            </li>
            <li>
              <Link href="/pages/privacy">Privacy</Link>
            </li>
            <li>
              <Link href="/pages/terms">Terms</Link>
            </li>
            <li>
              <Link href="/pages/cancellation-policy">Cancellation</Link>
            </li>
          </ul>
          <p className="mt-6 text-sm text-muted">
            {brand.supportEmail}
            <br />
            {brand.supportPhone}
          </p>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} {brand.legalName}
      </div>
    </footer>
  );
}
