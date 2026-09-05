"use client";

import { useState } from "react";

export default function AskAtria({ initial }: { initial?: string }) {
  const [query, setQuery] = useState(initial ?? "");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<{ id: string; name: string; slug: string }[]>([]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setAnswer(null);
    setProducts([]);
    const res = await fetch("/api/ask-atria", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    setAnswer(data.answer);
    setProducts(data.products ?? []);
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="mt-6 rounded-2xl border border-line bg-card p-4">
      <label className="block text-sm font-medium">Ask Atria</label>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Describe what you're looking for..."
        className="mt-2 h-11 w-full rounded-xl border border-line px-3 text-sm"
      />
      <button type="submit" className="mt-2 h-10 rounded-full bg-primary px-4 text-sm text-[#f6f1ea]" disabled={loading}>
        {loading ? "Thinking..." : "Ask"}
      </button>
      {answer ? (
        <div className="mt-3 text-sm">
          <p>{answer}</p>
          {products.length > 0 ? (
            <ul className="mt-2 list-disc pl-5">
              {products.map((p) => (
                <li key={p.id}>
                  <a href={`/product/${p.slug}`} className="underline">
                    {p.name}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
