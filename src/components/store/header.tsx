"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { getBrand } from "@/config/brand";
import { Logo } from "@/components/store/logo";
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
  const [moreOpen, setMoreOpen] = useState(false);
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

  useEffect(() => {
    if (!moreOpen) return;
    const handle = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest("[data-more-menu]")) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [moreOpen]);

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
        <Link href="/" className="font-display">
          <Logo />
        </Link>
        <nav className="ml-6 hidden min-w-0 flex-shrink items-center gap-2 text-sm lg:flex">
          {["fashion", "beauty", "kids", "gadgets"].map((slug) => {
            const category = categories.find((c) => c.slug === slug);
            if (!category) return null;
            return (
              <Link key={category.slug} href={`/category/${category.slug}`} className="text-[#3f3a34] hover:text-foreground truncate max-w-[90px]" title={category.name}>
                {category.name}
              </Link>
            );
          })}
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
          {categories.length > 0 ? (
            <div className="relative" data-more-menu>
              <button
                onClick={() => setMoreOpen((o) => !o)}
                className="inline-flex items-center gap-1 rounded-full border border-line bg-card px-3 py-1.5 text-[#3f3a34] hover:border-[#c4b8a8]"
                aria-expanded={moreOpen}
              >
                More
                <span className="mt-0.5">▼</span>
              </button>
              {moreOpen ? (
                <div className="absolute top-full mt-2 w-44 rounded-2xl border border-line bg-card p-1 shadow-lg">
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/category/${c.slug}`}
                      onClick={() => setMoreOpen(false)}
                      className="block rounded-xl px-3 py-2 text-sm hover:bg-[#f3ece3]"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search products"
               className="h-10 w-48 rounded-full border border-line bg-card pl-9 pr-4 text-sm lg:w-64"
              aria-label="Search"
            />
            {searchOpen && (visibleHits.length > 0 || query.length >= 2) ? (
              <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-line bg-card shadow-lg">
                {searching ? (
                  <p className="px-4 py-3 text-sm text-muted">Searching…</p>
                ) : visibleHits.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted">No suggestions</p>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    {visibleHits.map((hit) => (
                      <Link
                        key={hit.id}
                        href={hit.href}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[#f3ece3]"
                        onClick={() => setSearchOpen(false)}
                      >
                        {hit.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={hit.imageUrl} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover bg-[#ece6dc]" />
                        ) : (
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ece6dc] text-[10px] text-muted">
                            {hit.type === "category" ? "Cat" : "Prd"}
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block truncate">{hit.title}</span>
                          <span className="text-xs text-muted">{hit.subtitle}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
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
                <span className="font-display text-xl tracking-[0.2em] uppercase">{brandName}</span>
                <button
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto text-base text-[#161513]">
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
                <div className="space-y-1 border-t border-line pt-4">
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
