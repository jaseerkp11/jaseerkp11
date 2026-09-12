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
          {settings.gstin ? <p className="mt-3 text-xs text-muted">GSTIN {settings.gstin}</p> : null}
        </div>
        <div>
          <p className="text-sm font-semibold">Shop</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/products?sort=new">New & Trending</Link>
            </li>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/category/style">Style</Link>
            </li>
            <li>
              <Link href="/category/beauty">Beauty</Link>
            </li>
            <li>
              <Link href="/category/kids">Kids</Link>
            </li>
            <li>
              <Link href="/category/gifts">Gifts</Link>
            </li>
            <li>
              <Link href="/finds">Clever Finds</Link>
            </li>
            <li>
              <Link href="/products">All Products</Link>
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
            {brand.supportEmail && brand.supportEmail !== "hello@example.com" ? (
              <>
                <Link href={`mailto:${brand.supportEmail}`}>{brand.supportEmail}</Link>
                <br />
              </>
            ) : null}
            {brand.supportPhone && brand.supportPhone !== "+91 98765 43210" ? (
              <Link href={`tel:${brand.supportPhone.replace(/\s+/g, "")}`}>{brand.supportPhone}</Link>
            ) : null}
            {(!brand.supportEmail || brand.supportEmail === "hello@example.com") && (!brand.supportPhone || brand.supportPhone === "+91 98765 43210") ? (
              <span>Customer support details coming soon</span>
            ) : null}
          </p>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} TheRareify. All rights reserved.
      </div>
    </footer>
  );
}
