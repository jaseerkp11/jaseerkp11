import { prisma } from "@/lib/prisma";
import { rupeesToPaise } from "@/lib/money";

export type StoreSettings = {
  gstin: string;
  pan: string;
  businessAddress: string;
  warehouseAddress: string;
  whatsapp: string;
  invoiceNote: string;
  freeShippingRupees: string;
  standardShippingRupees: string;
  expressShippingRupees: string;
};

export const STORE_SETTING_DEFAULTS: StoreSettings = {
  gstin: "",
  pan: "",
  businessAddress: "",
  warehouseAddress: "",
  whatsapp: "",
  invoiceNote: "Prices are in INR. Keep this invoice for your records.",
  freeShippingRupees: "999",
  standardShippingRupees: "49",
  expressShippingRupees: "149",
};

const KEYS = Object.keys(STORE_SETTING_DEFAULTS) as Array<keyof StoreSettings>;

export async function getStoreSettings(): Promise<StoreSettings> {
  const rows = await prisma.siteSetting.findMany({
    where: { id: { in: KEYS } },
  });
  const map = Object.fromEntries(rows.map((row) => [row.id, row.value]));
  const settings = { ...STORE_SETTING_DEFAULTS };
  for (const key of KEYS) {
    if (typeof map[key] === "string") settings[key] = map[key];
  }
  return settings;
}

export async function saveStoreSettings(values: Partial<StoreSettings>): Promise<void> {
  for (const key of KEYS) {
    if (values[key] == null) continue;
    await prisma.siteSetting.upsert({
      where: { id: key },
      update: { value: values[key]! },
      create: { id: key, value: values[key]! },
    });
  }
}

export function whatsappDigits(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export function whatsappUrl(raw: string, text?: string): string | null {
  const digits = whatsappDigits(raw);
  if (digits.length < 11) return null;
  const url = new URL(`https://wa.me/${digits}`);
  if (text) url.searchParams.set("text", text);
  return url.toString();
}

export function shippingFeesPaise(settings: StoreSettings) {
  return {
    freeOverPaise: rupeesToPaise(Number(settings.freeShippingRupees) || 0),
    standardPaise: rupeesToPaise(Number(settings.standardShippingRupees) || 0),
    expressPaise: rupeesToPaise(Number(settings.expressShippingRupees) || 0),
  };
}
