"use client";
import { useFormStatus } from "react-dom";

export function AdminSearchForm({ defaultValue = "" }: { defaultValue?: string }) {
  const { pending } = useFormStatus();
  return (
    <form method="get" className="mt-4 flex items-center gap-2">
      <input
        name="q"
        defaultValue={defaultValue}
        placeholder="Search..."
        className="h-11 w-full max-w-md rounded-xl border border-line bg-card px-3 text-sm"
      />
      <button type="submit" disabled={pending} className="h-11 rounded-full border border-line px-4 text-sm">
        {pending ? "Searching..." : "Search"}
      </button>
    </form>
  );
}
