import Link from "next/link";
import { getStoreSettings, whatsappUrl } from "@/lib/services/store-settings";

export async function WhatsAppButton() {
  const settings = await getStoreSettings();
  const href = whatsappUrl(settings.whatsapp, "Hi, I have a question about an order / product.");
  if (!href) return null;
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-40 inline-flex h-12 items-center rounded-full bg-[#1f3d34] px-5 text-sm text-[#f6f1ea] shadow-lg"
    >
      WhatsApp
    </Link>
  );
}
