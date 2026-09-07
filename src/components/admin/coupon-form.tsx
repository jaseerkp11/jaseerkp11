"use client";
import { SubmitButton } from "@/components/ui/submit-button";

export function CouponForm() {
  return (
    <form action="/api/admin/coupons" method="post" className="mt-6 grid max-w-xl gap-3 rounded-2xl border border-line bg-card p-5">
      <input name="code" required placeholder="CODE" className="h-11 rounded-xl border border-line px-3 text-sm uppercase" />
      <select name="type" className="h-11 rounded-xl border border-line px-3 text-sm">
        <option value="PERCENTAGE">Percentage</option>
        <option value="FIXED">Fixed ₹</option>
      </select>
      <input name="value" type="number" required placeholder="Value (percent or rupees)" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <input name="minOrder" type="number" placeholder="Minimum order ₹" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <input name="usageLimit" type="number" placeholder="Usage limit" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <SubmitButton className="h-11 rounded-full bg-primary text-sm text-[#f6f1ea]">Create coupon</SubmitButton>
    </form>
  );
}
