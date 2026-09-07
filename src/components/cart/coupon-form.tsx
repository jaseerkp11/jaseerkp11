"use client";
import { SubmitButton } from "@/components/ui/submit-button";
import { useSearchParams } from "next/navigation";

export function CouponForm({ defaultValue }: { defaultValue?: string }) {
  const searchParams = useSearchParams();
  const error = searchParams.get("couponError");

  return (
    <form action="/api/cart/coupon" method="post" className="mt-4 space-y-2">
      <input
        name="code"
        defaultValue={defaultValue ?? ""}
        placeholder="Coupon code"
        className="h-11 w-full rounded-xl border border-line px-3 text-sm uppercase"
      />
      <SubmitButton className="h-10 w-full rounded-full border border-line text-sm">
        Apply coupon
      </SubmitButton>
      {error ? <p className="mt-2 text-xs text-[#9b2c2c]">{error}</p> : null}
    </form>
  );
}
