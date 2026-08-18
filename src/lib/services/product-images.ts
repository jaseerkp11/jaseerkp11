import { prisma } from "@/lib/prisma";

const EXTRA_KEYS = ["extraImage1", "extraImage2", "extraImage3", "extraImage4"] as const;
const EXTRA_DELETE_KEYS = ["deleteExtra1", "deleteExtra2", "deleteExtra3", "deleteExtra4"] as const;

export async function syncProductImages(
  productId: string,
  alt: string,
  form: FormData,
): Promise<void> {
  const slots: Array<{ url: string; type: string; position: number }> = [];

  const mainUrl = String(form.get("imageUrl") ?? "").trim();
  const deleteMain = form.get("deleteMain") === "on";
  if (mainUrl && !deleteMain) {
    slots.push({ url: mainUrl, type: "MAIN", position: 0 });
  }

  EXTRA_KEYS.forEach((key, index) => {
    const url = String(form.get(key) ?? "").trim();
    const remove = form.get(EXTRA_DELETE_KEYS[index]) === "on";
    if (url && !remove) {
      slots.push({ url, type: "GALLERY", position: index + 1 });
    }
  });

  await prisma.productImage.deleteMany({ where: { productId } });
  if (slots.length === 0) return;

  await prisma.productImage.createMany({
    data: slots.map((slot) => ({
      productId,
      url: slot.url,
      alt,
      type: slot.type,
      position: slot.position,
    })),
  });
}

export function splitProductImages(images: Array<{ id: string; url: string; alt: string; type: string; position: number }>) {
  const ordered = [...images].sort((a, b) => a.position - b.position);
  const main = ordered.find((img) => img.type === "MAIN") ?? ordered[0] ?? null;
  const extras = ordered.filter((img) => img.id !== main?.id).slice(0, 4);
  return { main, extras };
}
