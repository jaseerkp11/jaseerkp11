"use client";

import { getBrand } from "@/config/brand";

export function Logo({ className = "" }: { className?: string }) {
  const brand = getBrand();
  const name = brand.brandName;

  if (brand.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={brand.logoUrl} alt={name} className={className} />
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 font-display text-xl tracking-[0.25em] uppercase ${className}`}>
      <span className="hidden h-6 w-px bg-[#c4a574] sm:block" aria-hidden="true" />
      <span className="text-[#161513]">{name}</span>
    </span>
  );
}
