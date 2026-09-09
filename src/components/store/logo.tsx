"use client";

import { getBrand } from "@/config/brand";

export function Logo({ className = "" }: { className?: string }) {
  const brand = getBrand();

  if (brand.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={brand.logoUrl} alt={brand.brandName} className={className} />
    );
  }

  return (
    <span className={`font-display text-2xl tracking-[0.08em] normal-case ${className}`}>
      <span className="text-[#c4a574]">The</span> <span className="text-[#161513]">Rareify</span>
    </span>
  );
}
