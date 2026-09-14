"use client";

import { useState } from "react";

export function AdminDeleteForm({ action, label, _type }: { action: string; label: string; _type?: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!confirm(`Delete this ${label}?`)) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("_method", "DELETE");
      if (_type) formData.append("_type", _type);
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
    <button type="button" onClick={handleClick} disabled={loading} className="text-xs text-red-600 hover:text-red-700">
      {loading ? "Deleting…" : "Delete"}
    </button>
  );
}
