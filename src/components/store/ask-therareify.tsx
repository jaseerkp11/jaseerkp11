"use client";

import { useState } from "react";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { trackClientEvent } from "@/lib/analytics/client";

export function AskTherareify() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Array<{
    id: string;
    name: string;
    slug: string;
    sellingPaise: number;
    compareAtPaise: number | null;
    stock: number;
    reservedStock: number;
    images: Array<{ url: string; alt: string }>;
    reviews: Array<{ rating: number }>;
    reasons?: string[];
  }>>([]);
  const [message, setMessage] = useState("");

  const suggestions = [
    "Make my desk better",
    "Find a gift under ₹1,000",
    "Upgrade my room",
    "I'm travelling soon",
    "Make studying easier",
    "Surprise me",
  ];

  async function submit(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setQuery(q);
    try {
      const res = await fetch("/api/atria/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
        setMessage(data.message);
      } else {
        setMessage(data.error || data.message || "Something went wrong.");
      }
      trackClientEvent("ai_query", { query: q, resultCount: data.products?.length ?? 0 });
    } catch {
      setMessage("THERAREIFY is taking a quick break. Try again shortly.");
    } finally {
      setLoading(false);
    }
  }

  async function surprise() {
    setLoading(true);
    try {
      const res = await fetch("/api/atria/surprise");
      const data = await res.json();
      if (data.product) {
        setProducts([data.product]);
        setMessage("We think you might like this.");
      } else {
        setMessage(data.error || "No products available right now.");
      }
      trackClientEvent("surprise_me");
    } catch {
      setMessage("THERAREIFY is taking a quick break. Try again shortly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="rounded-[2rem] border border-line bg-card p-6 sm:p-10">
        <h2 className="font-display text-3xl">What are you looking for?</h2>
        <p className="mt-2 max-w-md text-sm text-muted">
          Tell THERAREIFY what you need. We&apos;ll find the best matches from our catalogue.
        </p>
        <form
          className="mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            submit(query);
          }}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="✨ Ask THERAREIFY anything..."
              className="h-12 w-full rounded-full border border-line bg-background px-4 text-sm sm:flex-1"
              aria-label="Ask THERAREIFY"
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="h-12 flex-1 px-6 sm:flex-none">
                {loading ? "Searching..." : "Ask"}
              </Button>
              <Button type="button" variant="ghost" onClick={surprise} disabled={loading} className="h-12 flex-1 px-6 sm:flex-none">
                ✨ Surprise Me
              </Button>
            </div>
          </div>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => submit(s)}
              className="rounded-full border border-line px-4 py-2 text-sm hover:bg-[#f3ece3]"
            >
              {s}
            </button>
          ))}
        </div>

        {message ? (
          <div className="mt-8">
            <p className="text-sm font-medium">{message}</p>
            {products.length > 0 ? (
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                {products.map((p) => (
                  <div key={p.id}>
                    <ProductCard product={p} />
                    {p.reasons && p.reasons.length > 0 ? (
                      <p className="mt-2 text-xs text-muted">{p.reasons[0]}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
            {query ? (
              <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted">
                <span>Refine:</span>
                {["cheaper", "more options", "different style"].map((ref) => (
                  <button
                    key={ref}
                    type="button"
                    onClick={() => submit(`${query} ${ref}`)}
                    className="underline"
                  >
                    {ref}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
