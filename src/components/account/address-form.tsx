"use client";
import { SubmitButton } from "@/components/ui/submit-button";

export function AddressForm() {
  return (
    <form action="/api/account/addresses" method="post" className="mt-8 grid gap-3 rounded-2xl border border-line bg-card p-5">
      <h2 className="font-medium">Add address</h2>
      <input name="label" placeholder="Label" defaultValue="Home" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <input name="fullName" required placeholder="Full name" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <input name="phone" required placeholder="Phone" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <input name="line1" required placeholder="Line 1" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <input name="line2" placeholder="Line 2" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <input name="city" required placeholder="City" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <input name="state" required placeholder="State" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <input name="pincode" required placeholder="Pincode" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <SubmitButton className="h-11 rounded-full bg-primary text-sm text-[#f6f1ea]">Save address</SubmitButton>
    </form>
  );
}
