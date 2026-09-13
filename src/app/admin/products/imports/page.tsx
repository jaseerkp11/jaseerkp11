import { previewProductImport } from "@/lib/imports/products";

export default function ProductImportsPage() {
  const sample = previewProductImport([
    { sku: "AT-DEMO", name: "Demo row", price: "999", cost: "400" },
    { sku: "", name: "", price: "abc" },
  ]);
  return (
    <div>
      <h1 className="font-display text-3xl">Product imports</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        CSV/Excel/API feeds are architected but not auto-applied. Preview validation runs first so a bad file cannot silently overwrite the catalogue.
      </p>
      <p className="mt-6 text-sm">Sample preview (not imported): {sample.valid.length} valid / {sample.invalid.length} invalid</p>
    </div>
  );
}
