"use client";
import { SubmitButton } from "@/components/ui/submit-button";
import { useSearchParams } from "next/navigation";

export function PasswordForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <form action="/api/account/password" method="post" className="mt-6 space-y-3">
      {error ? <p className="text-sm text-[#9b2c2c]">{error}</p> : null}
      <label className="block text-sm">
        Current password
        <input name="current" type="password" required className="mt-1 h-11 w-full rounded-xl border border-line px-3 text-sm" />
      </label>
      <label className="block text-sm">
        New password
        <input name="next" type="password" required className="mt-1 h-11 w-full rounded-xl border border-line px-3 text-sm" />
      </label>
      <SubmitButton className="h-11 w-full rounded-full bg-primary text-sm text-[#f6f1ea]">Update password</SubmitButton>
    </form>
  );
}
