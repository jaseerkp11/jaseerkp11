"use client";

import { useState, useCallback } from "react";

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
  const [active, setActive] = useState<GalleryImage | null>(main);
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);
  const slots = [0, 1, 2, 3].map((index) => extras[index] ?? null);

  const openLightbox = useCallback((image: GalleryImage) => {
    setLightbox(image);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightbox(null);
  }, []);

  return (
    <div className="space-y-3">
      <div
        className="group relative overflow-hidden rounded-[1.5rem] bg-[#ece6dc]"
        onClick={() => active && openLightbox(active)}
      >
        {active ? (
          <img
            src={active.url}
            alt={active.alt}
            className="aspect-[4/5] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex aspect-[4/5] items-center justify-center text-sm text-muted">
            No main image
          </div>
        )}
        {active ? (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span className="rounded-full bg-black/40 px-4 py-2 text-xs text-white backdrop-blur-sm">
              Click to enlarge
            </span>
          </div>
        ) : null}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {slots.map((image, index) => {
          const isActive = active?.id === image?.id;
          return (
            <button
              key={image?.id ?? `empty-${index}`}
              type="button"
              className={`aspect-square overflow-hidden rounded-xl bg-[#ece6dc] transition-all ${
                isActive ? "ring-2 ring-primary ring-offset-2" : "hover:ring-2 hover:ring-primary/50"
              }`}
              onClick={() => image && setActive(image)}
              onMouseEnter={() => image && setActive(image)}
              onFocus={() => image && setActive(image)}
              disabled={!image}
              aria-label={image ? `View photo ${index + 1}` : `Empty photo slot ${index + 1}`}
              aria-pressed={isActive}
            >
              {image ? (
                <img
                  src={image.url}
                  alt={image.alt}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full items-center justify-center text-[10px] text-muted">
                  {index + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {lightbox ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={closeLightbox}
        >
          <img
            src={lightbox.url}
            alt={lightbox.alt}
            className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
          />
          <button
            type="button"
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            aria-label="Close preview"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      ) : null}
    </div>
  );
}
