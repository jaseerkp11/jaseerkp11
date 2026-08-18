export type ProductImageSlot = {
  id: string;
  url: string;
  alt: string;
  type: string;
  position: number;
};

export function splitProductImages(images: ProductImageSlot[]) {
  const ordered = [...images].sort((a, b) => a.position - b.position);
  const main = ordered.find((img) => img.type === "MAIN") ?? ordered[0] ?? null;
  const extras = ordered.filter((img) => img.id !== main?.id).slice(0, 4);
  return { main, extras };
}
