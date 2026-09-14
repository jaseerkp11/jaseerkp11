"use client";
import { useFormStatus } from "react-dom";

const PRODUCT_STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
  { value: "ARCHIVED", label: "Archived" },
  { value: "OUT_OF_STOCK", label: "Out of stock" },
];

export function AdminFilters({
  defaultQ = "",
  defaultStatus = "",
  statusOptions = PRODUCT_STATUS_OPTIONS,
}: {
  defaultQ?: string;
  defaultStatus?: string;
  statusOptions?: Array<{ value: string; label: string }>;
}) {
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
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <button type="submit" disabled={pending} className="h-11 rounded-full border border-line px-4 text-sm">
        {pending ? "Searching..." : "Filter"}
      </button>
    </form>
  );
}
