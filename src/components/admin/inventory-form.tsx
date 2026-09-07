"use client";
import { SubmitButton } from "@/components/ui/submit-button";

interface InventoryFormProps {
  products: Array<{ id: string; name: string; sku: string }>;
}

export function InventoryForm({ products }: InventoryFormProps) {
  return (
    <form action="/api/admin/inventory" method="post" className="mt-6 grid max-w-xl gap-3 rounded-2xl border border-line bg-card p-5">
      <select name="productId" required className="h-11 rounded-xl border border-line px-3 text-sm">
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} ({p.sku})
          </option>
        ))}
      </select>
      <input name="delta" type="number" required placeholder="Delta (e.g. 10 or -2)" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <input name="note" placeholder="Reason" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <SubmitButton className="h-11 rounded-full bg-primary text-sm text-[#f6f1ea]">Record adjustment</SubmitButton>
    </form>
  );
}
