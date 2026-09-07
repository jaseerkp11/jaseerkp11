"use client";
import { SubmitButton } from "@/components/ui/submit-button";

export function CategoryForm({ parents }: { parents: Array<{ id: string; name: string }> }) {
  return (
    <form action="/api/admin/categories" method="post" className="mt-6 grid max-w-xl gap-3 rounded-2xl border border-line bg-card p-5">
      <input name="name" required placeholder="Name" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <input name="slug" required placeholder="slug" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <textarea name="description" placeholder="Description" className="min-h-20 rounded-xl border border-line px-3 py-2 text-sm" />
      <select name="parentId" className="h-11 rounded-xl border border-line px-3 text-sm">
        <option value="">No parent</option>
        {parents.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <SubmitButton className="h-11 rounded-full bg-primary text-sm text-[#f6f1ea]">Create category</SubmitButton>
    </form>
  );
}
