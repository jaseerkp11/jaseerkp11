"use client";

import { useState } from "react";

type GalleryImage = {
  id: string;
  url: string;
  alt: string;
};

export function ProductGallery({
  main,
  extras,
}: {
  main: GalleryImage | null;
  extras: GalleryImage[];
}) {
  const [hovered, setHovered] = useState<GalleryImage | null>(null);
  const shown = hovered ?? main;
  const slots = [0, 1, 2, 3].map((index) => extras[index] ?? null);

  return (
    <div className="space-y-3">
      <div className="group relative overflow-hidden rounded-[1.5rem] bg-[#ece6dc]">
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shown.url}
            alt={shown.alt}
            className="aspect-[4/5] w-full object-cover transition duration-300 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex aspect-[4/5] items-center justify-center text-sm text-muted">
            No main image
          </div>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {slots.map((image, index) => (
          <button
            key={image?.id ?? `empty-${index}`}
            type="button"
            className="aspect-square overflow-hidden rounded-xl bg-[#ece6dc]"
            disabled={!image}
            onMouseEnter={() => image && setHovered(image)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => image && setHovered(image)}
            onBlur={() => setHovered(null)}
            aria-label={image ? `View extra photo ${index + 1}` : `Empty extra photo ${index + 1}`}
          >
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image.url} alt={image.alt} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full items-center justify-center text-[10px] text-muted">
                {index + 1}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
