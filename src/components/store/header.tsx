"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { getBrand } from "@/config/brand";
import type { SearchHit } from "@/lib/search/provider";

type CategoryLink = { name: string; slug: string };

export function Header({
  categories,
  cartCount,
  brandName,
}: {
  categories: CategoryLink[];
  cartCount: number;
  brandName: string;
}) {
  const brand = getBrand();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const visibleHits = query.trim().length < 2 ? [] : hits;

  useEffect(() => {
    if (query.trim().length < 2) {
      setSearching(false);
      return;
    }
    setSearching(true);
    const handle = window.setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) {
        setSearching(false);
        return;
      }
      const data = (await res.json()) as { hits: SearchHit[] };
      setHits(data.hits);
      setSearching(false);
    }, 220);
    return () => window.clearTimeout(handle);
  }, [query]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-card lg:hidden"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/" className="font-display text-2xl tracking-tight">
          {brand.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logoUrl} alt={brandName} className="h-8" />
          ) : (
            brandName
          )}
        </Link>
        <nav className="ml-6 hidden items-center gap-5 text-sm lg:flex">
          {categories.slice(0, 7).map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} className="text-[#3f3a34] hover:text-foreground truncate max-w-[90px]" title={c.name}>
              {c.name}
            </Link>
          ))}
          <Link href="/drops" className="text-[#3f3a34] hover:text-foreground">
            Drops
          </Link>
          <Link href="/finds" className="text-[#3f3a34] hover:text-foreground">
            Finds
          </Link>
          <Link href="/collections" className="text-[#3f3a34] hover:text-foreground">
            Collections
          </Link>
          <Link href="/products" className="text-[#3f3a34] hover:text-foreground">
            All
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search products"
              className="h-10 w-64 rounded-full border border-line bg-card pl-9 pr-4 text-sm lg:w-80"
              aria-label="Search"
            />
            {searchOpen && (visibleHits.length > 0 || query.length >= 2) ? (
              <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-line bg-card shadow-lg">
                {searching ? (
                  <p className="px-4 py-3 text-sm text-muted">Searching…</p>
                ) : visibleHits.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted">No suggestions</p>
                ) : (
                  visibleHits.map((hit) => (
                    <Link
                      key={hit.id}
                      href={hit.href}
                      className="block px-4 py-2.5 text-sm hover:bg-[#f3ece3]"
                      onClick={() => setSearchOpen(false)}
                    >
                      <span className="block">{hit.title}</span>
                      <span className="text-xs text-muted">{hit.subtitle}</span>
                    </Link>
                  ))
                )}
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  className="block border-t border-line px-4 py-2.5 text-sm font-medium"
                >
                  View all results
                </Link>
              </div>
            ) : null}
          </div>
          <Link
            href="/search"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-card md:hidden"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Link>
          <Link
            href="/account"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-line bg-card sm:inline-flex"
            aria-label="Account"
          >
            <User className="h-5 w-5" />
          </Link>
          <Link
            href="/account/wishlist"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-line bg-card sm:inline-flex"
            aria-label="Wishlist"
          >
            <span className="text-sm">♡</span>
          </Link>
          <Link
            href="/cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-[#f6f1ea]"
            aria-label={`Cart, ${cartCount} items`}
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <div
            className="relative h-screen w-[min(100%,20rem)] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-full flex-col p-6">
              <div className="mb-8 flex items-center justify-between">
                <span className="font-display text-xl">{brandName}</span>
                <button
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-1 flex-col gap-1 text-base text-[#161513]">
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/category/${c.slug}`}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-2.5 font-medium transition hover:bg-black/5"
                  >
                    {c.name}
                  </Link>
                ))}
                <Link
                  href="/drops"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 font-medium transition hover:bg-black/5"
                >
                  Drops
                </Link>
                <Link
                  href="/finds"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 font-medium transition hover:bg-black/5"
                >
                  Finds
                </Link>
                <Link
                  href="/collections"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 font-medium transition hover:bg-black/5"
                >
                  Collections
                </Link>
                <Link
                  href="/products"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 font-medium transition hover:bg-black/5"
                >
                  All products
                </Link>
                <div className="mt-auto space-y-1 border-t border-line pt-4">
                  <Link
                    href="/account"
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-3 py-2.5 font-medium transition hover:bg-black/5"
                  >
                    Account
                  </Link>
                  <Link
                    href="/account/wishlist"
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-3 py-2.5 font-medium transition hover:bg-black/5"
                  >
                    Wishlist
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
