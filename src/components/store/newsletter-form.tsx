"use client";
import { SubmitButton } from "@/components/ui/submit-button";
import { useSearchParams } from "next/navigation";

export function NewsletterForm() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  return (
    <form action="/api/newsletter" method="post" className="mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
      <input
        name="email"
        type="email"
        required
        placeholder="Email"
        className="h-12 flex-1 rounded-full bg-white/10 px-5 text-sm text-[#f6f1ea] placeholder:text-[#b7b0a6] backdrop-blur"
      />
      <SubmitButton className="h-12 rounded-full bg-[#c4a574] px-8 text-sm font-medium text-[#161513] transition hover:bg-[#b49a6a]" type="submit">
        Request updates
      </SubmitButton>
      {message ? <p className="text-sm text-[#b7b0a6]">{message}</p> : null}
    </form>
  );
}
