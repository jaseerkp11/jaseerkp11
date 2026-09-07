"use client";
import { SubmitButton } from "@/components/ui/submit-button";

export function SupplierForm() {
  return (
    <form action="/api/admin/suppliers" method="post" className="mt-6 grid max-w-xl gap-3 rounded-2xl border border-line bg-card p-5">
      <input name="name" required placeholder="Name" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <input name="contactPerson" placeholder="Contact" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <input name="email" placeholder="Email" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <input name="phone" placeholder="Phone" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <textarea name="notes" placeholder="Notes" className="min-h-20 rounded-xl border border-line px-3 py-2 text-sm" />
      <SubmitButton className="h-11 rounded-full bg-primary text-sm text-[#f6f1ea]">Add supplier</SubmitButton>
    </form>
  );
}
