"use client";
import { SubmitButton } from "@/components/ui/submit-button";

interface CartItemFormProps {
  itemId: string;
  quantity: number;
}

export function CartItemUpdateForm({ itemId, quantity }: CartItemFormProps) {
  return (
    <form action="/api/cart/update" method="post" className="mt-2 flex items-center gap-2">
      <input type="hidden" name="itemId" value={itemId} />
      <input
        name="quantity"
        type="number"
        min={1}
        max={20}
        defaultValue={quantity}
        className="h-9 w-16 rounded-lg border border-line px-2 text-sm"
      />
      <SubmitButton className="text-sm underline">Update</SubmitButton>
    </form>
  );
}

export function CartItemRemoveForm({ itemId }: { itemId: string }) {
  return (
    <form action="/api/cart/remove" method="post">
      <input type="hidden" name="itemId" value={itemId} />
      <SubmitButton type="submit" className="mt-1 text-xs text-muted underline">
        Remove
      </SubmitButton>
    </form>
  );
}
