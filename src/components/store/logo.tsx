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
    <span className={`inline-flex items-baseline font-display text-[1.65rem] tracking-[0.06em] normal-case whitespace-nowrap ${className}`}>
      <span className="text-[#c4a574]">The</span>
      <span className="text-[#161513]">Rareify</span>
    </span>
  );
}
