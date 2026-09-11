"use client";

import { useState } from "react";

export function AdminDeleteForm({ action, label }: { action: string; label: string }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!confirm(`Delete this ${label}?`)) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("_method", "DELETE");
      await fetch(action, {
        method: "POST",
        body: formData,
      });
      window.location.reload();
    } catch {
      alert("Delete failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={loading} className="text-xs text-red-600 hover:text-red-700">
        {loading ? "Deleting…" : "Delete"}
      </button>
    </form>
  );
}
