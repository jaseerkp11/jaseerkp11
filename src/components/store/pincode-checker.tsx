"use client";

import { useState } from "react";

type Quote = {
  method: string;
  label: string;
  amountPaise: number;
  etaDaysMin: number;
  etaDaysMax: number;
  available: boolean;
  message?: string;
};

export function PincodeChecker() {
  const [pincode, setPincode] = useState("");
  const [quotes, setQuotes] = useState<Quote[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch(`/api/shipping/quote?pincode=${encodeURIComponent(pincode)}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Unable to quote shipping");
      setQuotes(null);
      return;
    }
    setQuotes(data.quotes);
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 rounded-2xl border border-line bg-card p-4">
      <p className="text-sm font-medium">Delivery estimate</p>
      <div className="mt-2 flex gap-2">
        <input
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          inputMode="numeric"
          placeholder="Pincode"
          className="h-11 flex-1 rounded-xl border border-line px-3 text-sm"
          aria-label="Pincode"
        />
        <button className="h-11 rounded-full bg-[#161513] px-4 text-sm text-[#f6f1ea]" type="submit">
          Check
        </button>
      </div>
      {error ? <p className="mt-2 text-xs text-[#9b2c2c]">{error}</p> : null}
      {quotes ? (
        <ul className="mt-3 space-y-1 text-sm">
          {quotes.map((q) => (
            <li key={q.method}>
              {q.available
                ? `${q.label}: ₹${(q.amountPaise / 100).toFixed(0)} · ${q.etaDaysMin}–${q.etaDaysMax} days`
                : q.message}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-muted">
          Uses the built-in pincode table. Live carrier tracking is not connected.
        </p>
      )}
    </form>
  );
}
