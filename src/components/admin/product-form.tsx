"use client";

import { useMemo, useState } from "react";
import { marginPercent, rupeesToPaise } from "@/lib/money";
import { splitProductImages } from "@/lib/services/product-image-slots";

type Option = { id: string; name: string };

type ProductImage = {
  id: string;
  url: string;
  alt: string;
  type: string;
  position: number;
};

type ProductValues = {
  id?: string;
  sku?: string;
  name?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  categoryId?: string;
  supplierId?: string | null;
  brand?: string;
  costPaise?: number;
  sellingPaise?: number;
  compareAtPaise?: number | null;
  stock?: number;
  lowStockThreshold?: number;
  status?: string;
  featured?: boolean;
  trending?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  images?: ProductImage[];
};

function ImageSlot({
  label,
  hint,
  name,
  deleteName,
  url,
  onUrlChange,
}: {
  label: string;
  hint: string;
  name: string;
  deleteName: string;
  url: string;
  onUrlChange: (value: string) => void;
}) {
  return (
    <div className="rounded-2xl border-2 border-line bg-card p-4">
      <p className="text-base font-medium">{label}</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="mt-3 aspect-square w-full rounded-xl object-cover bg-[#ece6dc]" />
      ) : (
        <div className="mt-3 flex aspect-square items-center justify-center rounded-xl border border-dashed border-line bg-[#ece6dc] text-sm text-muted">
          Paste a photo URL below
        </div>
      )}
      <input
        name={name}
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="https://… or /images/…"
        className="mt-3 h-11 w-full rounded-xl border border-line px-3 text-sm"
      />
      <button
        type="button"
        className="mt-2 h-10 w-full rounded-xl border border-[#9b2c2c] text-sm text-[#9b2c2c]"
        onClick={() => onUrlChange("")}
      >
        Remove this photo
      </button>
      <label className="mt-2 flex items-center gap-2 text-xs text-[#9b2c2c]">
        <input type="checkbox" name={deleteName} />
        Delete on save
      </label>
    </div>
  );
}

export function ProductForm({
  categories,
  suppliers,
  product,
}: {
  categories: Option[];
  suppliers: Option[];
  product?: ProductValues;
}) {
  const [cost, setCost] = useState(((product?.costPaise ?? 0) / 100).toString());
  const [sell, setSell] = useState(((product?.sellingPaise ?? 0) / 100).toString());
  const split = splitProductImages(product?.images ?? []);
  const [mainUrl, setMainUrl] = useState(split.main?.url ?? "");
  const [extras, setExtras] = useState(["", "", "", ""].map((empty, i) => split.extras[i]?.url ?? empty));
  const margin = useMemo(() => {
    const c = rupeesToPaise(Number(cost) || 0);
    const s = rupeesToPaise(Number(sell) || 0);
    return marginPercent(s, c);
  }, [cost, sell]);
  const action = product?.id ? `/api/admin/products/${product.id}` : "/api/admin/products";

  return (
    <form action={action} method="post" className="mt-6 grid max-w-5xl gap-4">
      <section className="rounded-3xl border-2 border-primary/40 bg-[#f6f1ea] p-4 sm:p-5">
        <h2 className="font-display text-2xl">Product photos</h2>
        <p className="mt-1 text-sm text-muted">
          Add the main photo first, then up to four more photos. These extra photos become the four small boxes on the shop product page. Hovering a small box shows that photo large.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ImageSlot
            label="Main image"
            hint="Large photo on the product page and in the dashboard list"
            name="imageUrl"
            deleteName="deleteMain"
            url={mainUrl}
            onUrlChange={setMainUrl}
          />
          {extras.map((url, index) => (
            <ImageSlot
              key={index}
              label={`Extra photo ${index + 1}`}
              hint={`Small box ${index + 1} on the product page`}
              name={`extraImage${index + 1}`}
              deleteName={`deleteExtra${index + 1}`}
              url={url}
              onUrlChange={(value) =>
                setExtras((current) => current.map((item, i) => (i === index ? value : item)))
              }
            />
          ))}
        </div>
      </section>
      <input name="sku" required defaultValue={product?.sku} placeholder="SKU" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <input name="name" required defaultValue={product?.name} placeholder="Name" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <input name="slug" required defaultValue={product?.slug} placeholder="slug" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <textarea name="shortDescription" defaultValue={product?.shortDescription} placeholder="Short description" className="min-h-20 rounded-xl border border-line px-3 py-2 text-sm" />
      <textarea name="description" defaultValue={product?.description} placeholder="Description" className="min-h-32 rounded-xl border border-line px-3 py-2 text-sm" />
      <select name="categoryId" required defaultValue={product?.categoryId} className="h-11 rounded-xl border border-line px-3 text-sm">
        <option value="">Category</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <select name="supplierId" defaultValue={product?.supplierId ?? ""} className="h-11 rounded-xl border border-line px-3 text-sm">
        <option value="">Supplier (optional)</option>
        {suppliers.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <input name="brand" defaultValue={product?.brand} placeholder="Brand" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm">
          Cost (₹)
          <input name="costRupees" value={cost} onChange={(e) => setCost(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-line px-3" />
        </label>
        <label className="text-sm">
          Selling (₹)
          <input name="sellingRupees" value={sell} onChange={(e) => setSell(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-line px-3" />
        </label>
        <label className="text-sm">
          Compare-at (₹)
          <input name="compareRupees" defaultValue={product?.compareAtPaise ? product.compareAtPaise / 100 : ""} className="mt-1 h-11 w-full rounded-xl border border-line px-3" />
        </label>
      </div>
      <p className="text-sm">Margin {margin}% (not shown to customers)</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="stock" type="number" min={0} defaultValue={product?.stock ?? 0} className="h-11 rounded-xl border border-line px-3 text-sm" />
        <input name="lowStockThreshold" type="number" min={0} defaultValue={product?.lowStockThreshold ?? 5} className="h-11 rounded-xl border border-line px-3 text-sm" />
      </div>
      <select name="status" defaultValue={product?.status ?? "ACTIVE"} className="h-11 rounded-xl border border-line px-3 text-sm">
        <option>DRAFT</option>
        <option>ACTIVE</option>
        <option>ARCHIVED</option>
        <option>OUT_OF_STOCK</option>
      </select>
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="featured" defaultChecked={product?.featured} /> Featured
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="trending" defaultChecked={product?.trending} /> Trending
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="bestSeller" defaultChecked={product?.bestSeller} /> Best seller
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="newArrival" defaultChecked={product?.newArrival} /> New
        </label>
      </div>
      <input name="seoTitle" defaultValue={product?.seoTitle ?? ""} placeholder="SEO title" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <input name="seoDescription" defaultValue={product?.seoDescription ?? ""} placeholder="SEO description" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <button className="h-11 rounded-full bg-primary text-sm text-[#f6f1ea]">{product?.id ? "Save photos and product" : "Create"}</button>
    </form>
  );
}
