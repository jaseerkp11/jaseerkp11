"use client";
import { SubmitButton } from "@/components/ui/submit-button";

interface Variant {
  id: string;
  name: string;
}

interface AddToCartFormProps {
  productId: string;
  available: number;
  sellingPaise: number;
  currency: string;
  currencySymbol: string;
  variants?: Variant[];
  lowStockThreshold?: number;
}

export function AddToCartForm({ productId, available, sellingPaise, currency, currencySymbol, variants = [], lowStockThreshold = 5 }: AddToCartFormProps) {
  return (
    <form action="/api/cart" method="post" className="mt-6 space-y-4">
      <input type="hidden" name="productId" value={productId} />
      {variants.length > 0 ? (
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Options</legend>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant, index) => (
              <label key={variant.id} className="cursor-pointer">
                <input
                  type="radio"
                  name="variantId"
                  value={variant.id}
                  defaultChecked={index === 0}
                  className="peer sr-only"
                />
                <span className="inline-flex h-10 items-center rounded-full border border-line px-4 text-sm peer-checked:border-primary peer-checked:bg-primary peer-checked:text-[#f6f1ea]">
                  {variant.name}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}
      <div>
        <label htmlFor="qty" className="mb-1 block text-sm font-medium">
          Quantity
        </label>
        <input
          id="qty"
          name="quantity"
          type="number"
          min={1}
          max={20}
          defaultValue={1}
          className="h-11 w-24 rounded-xl border border-line bg-card px-3"
        />
      </div>
      <p className="text-sm">
        {available <= 0
          ? "Currently unavailable"
          : available <= lowStockThreshold
            ? `Only ${available} left`
            : "In stock"}
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <SubmitButton className="h-12 flex-1 rounded-full bg-primary text-sm text-[#f6f1ea] disabled:opacity-50" disabled={available <= 0}>
          Add to cart
        </SubmitButton>
        <a
          href="/checkout"
          className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-[#161513] text-sm text-[#f6f1ea]"
        >
          Buy now
        </a>
      </div>
    </form>
  );
}
