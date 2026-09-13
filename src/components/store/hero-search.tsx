"use client";

import { useState, useCallback, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles } from "lucide-react";

const CHIPS = [
  "Make my home easier",
  "Find a gift under ₹1,000",
  "Make my room better",
  "Make travelling easier",
  "Make studying easier",
  "Show me something clever",
];

export function HeroSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");

  const submit = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) return;
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [router]
  );

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      submit(value);
    },
    [submit, value]
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submit(value);
      }
    },
    [submit, value]
  );

  return (
    <div className="w-full max-w-2xl px-4">
      <div className="rounded-3xl border border-white/20 bg-white/[0.07] px-6 pb-5 pt-6 shadow-2xl backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.25em] text-white/70">
          What are you looking for?
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-white/80">
          Tell TheRarify what you need. We&apos;ll find something worth discovering.
        </p>

        <form onSubmit={onSubmit} className="mt-5">
          <label htmlFor="hero-search" className="sr-only">
            Ask TheRarify anything
          </label>
          <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.06] px-3 transition-colors focus-within:border-white/30 focus-within:bg-white/[0.1]">
            <Sparkles className="h-4 w-4 shrink-0 text-white/60" />
            <input
              id="hero-search"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="✨ Ask TheRarify anything..."
              className="h-11 flex-1 bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
              autoComplete="off"
            />
            <button
              type="submit"
              aria-label="Ask TheRarify"
              className="shrink-0 rounded-xl bg-white/10 px-4 py-2 text-xs font-medium tracking-wide text-white transition hover:bg-white/20 focus:outline-none focus:ring-1 focus:ring-white/40"
            >
              Ask
            </button>
          </div>
        </form>

        <button
          type="button"
          onClick={() => router.push("/finds")}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium tracking-wide text-white/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-1 focus:ring-white/30"
        >
          <Sparkles className="h-3.5 w-3.5" />
          ✨ Surprise Me
        </button>

        <div className="mt-5 flex flex-wrap gap-2">
          {CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                setValue(chip);
                router.push(`/search?q=${encodeURIComponent(chip)}`);
              }}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] tracking-wide text-white/75 transition hover:bg-white/15 hover:text-white focus:outline-none focus:ring-1 focus:ring-white/30"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
