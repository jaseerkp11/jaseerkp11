"use client";
import { useFormStatus } from "react-dom";

export function AdminFilters({ defaultQ = "", defaultStatus = "" }: { defaultQ?: string; defaultStatus?: string }) {
  const { pending } = useFormStatus();
  return (
    <form method="get" className="mt-4 flex flex-wrap items-center gap-2">
      <input
        name="q"
        defaultValue={defaultQ}
        placeholder="Search..."
        className="h-11 w-full max-w-md rounded-xl border border-line bg-card px-3 text-sm"
      />
      <select name="status" defaultValue={defaultStatus} className="h-11 rounded-xl border border-line bg-card px-3 text-sm">
        <option value="">All statuses</option>
        <option value="DRAFT">Draft</option>
        <option value="ACTIVE">Active</option>
        <option value="ARCHIVED">Archived</option>
        <option value="OUT_OF_STOCK">Out of stock</option>
      </select>
      <button type="submit" disabled={pending} className="h-11 rounded-full border border-line px-4 text-sm">
        {pending ? "Searching..." : "Filter"}
      </button>
    </form>
  );
}
