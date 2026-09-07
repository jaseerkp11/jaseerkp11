"use client";
import { SubmitButton } from "@/components/ui/submit-button";

export function TrackForm() {
  return (
    <form action="/api/track" method="post" className="mt-8 grid gap-3">
      <input name="orderNumber" required placeholder="Order number" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <input name="phone" required placeholder="Phone" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <SubmitButton className="h-11 rounded-full bg-primary text-sm text-[#f6f1ea]">Find order</SubmitButton>
    </form>
  );
}
