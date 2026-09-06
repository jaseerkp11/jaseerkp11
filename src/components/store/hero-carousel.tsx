"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Slide = {
  id: string;
  name: string;
  slug: string;
  sellingPaise: number;
  compareAtPaise: number | null;
  images: Array<{ url: string; alt: string }>;
};

export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const current = slides[index] ?? null;

  useEffect(() => {
    if (!slides.length) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 4000);
    return () => clearInterval(id);
  }, [slides.length]);

  if (!slides.length) return null;

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-[#efe8de]">
      {slides.map((slide, i) => {
        const active = i === index;
        return (
          <Link
            key={slide.id}
            href={`/products/${slide.slug}`}
            className={`absolute inset-0 transition-opacity duration-700 ${
              active ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="flex h-full flex-col justify-end p-6 sm:p-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.images[0]?.url ?? "/images/products/linen-overshirt.svg"}
                alt={slide.images[0]?.alt ?? slide.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="relative">
                <p className="text-sm text-[#f6f1ea]/90">{slide.name}</p>
                <p className="mt-1 font-display text-2xl text-[#f6f1ea]">
                  {slide.compareAtPaise && slide.compareAtPaise > slide.sellingPaise ? (
                    <>
                      <span className="text-[#c4a574]">₹{((slide.compareAtPaise - (slide.compareAtPaise - slide.sellingPaise)) / 100).toLocaleString("en-IN")}</span>
                      <span className="ml-2 text-sm line-through text-[#f6f1ea]/70">
                        ₹{(slide.compareAtPaise / 100).toLocaleString("en-IN")}
                      </span>
                    </>
                  ) : (
                    <span>₹{(slide.sellingPaise / 100).toLocaleString("en-IN")}</span>
                  )}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition ${
              i === index ? "w-6 bg-[#c4a574]" : "w-2 bg-white/60 hover:bg-white"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
