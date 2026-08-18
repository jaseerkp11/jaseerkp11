"use client";

import { useMemo, useState } from "react";
import { marginPercent, rupeesToPaise } from "@/lib/money";

type Option = { id: string; name: string };

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
};

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
  const margin = useMemo(() => {
    const c = rupeesToPaise(Number(cost) || 0);
    const s = rupeesToPaise(Number(sell) || 0);
    return marginPercent(s, c);
  }, [cost, sell]);
  const action = product?.id ? `/api/admin/products/${product.id}` : "/api/admin/products";

  return (
    <form action={action} method="post" className="mt-6 grid max-w-3xl gap-4">
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
      <input name="imageUrl" placeholder="Main image URL (optional)" className="h-11 rounded-xl border border-line px-3 text-sm" />
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
      <button className="h-11 rounded-full bg-primary text-sm text-[#f6f1ea]">{product?.id ? "Save" : "Create"}</button>
    </form>
  );
}
