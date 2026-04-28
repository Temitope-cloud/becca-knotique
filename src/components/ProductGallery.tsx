"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type ProductGalleryProps = {
  images: string[];
  name: string;
};

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const [activeImage, setActiveImage] = useState(safeImages[0] ?? "");

  if (!safeImages.length) {
    return (
      <div className="relative aspect-4/5 w-full overflow-hidden rounded-xl bg-neutral-200">
        <div className="absolute inset-0 grid place-items-center text-sm font-medium text-stone-500">
          Image coming soon
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-4/5 w-full shrink-0 overflow-scroll rounded-xl bg-neutral-200">
      <div className="pointer-events-none absolute inset-0 z-10 rounded-xl bg-linear-to-t from-black via-black/10 to-transparent" />

      <Image
        src={activeImage}
        alt={`${name} — product photo`}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover"
      />

      <div className="absolute inset-x-0 bottom-0 z-20 px-2 pt-10 pb-3 sm:px-3 sm:pb-4">
        <ul
          className="-mx-1 flex touch-pan-x list-none flex-col gap-2 overflow-x-auto overflow-y-hidden px-1 pb-1 [scrollbar-width:thin] max-md:snap-x max-md:snap-mandatory sm:justify-center sm:gap-3 md:mx-0 md:flex-wrap md:justify-center md:overflow-x-visible md:px-0"
          aria-label="Product gallery thumbnails"
        >
          {safeImages.map((img, index) => (
            <li
              key={`${img}-${index}`}
              className="shrink-0 max-md:snap-center md:snap-align-none"
            >
              <button
                type="button"
                onClick={() => setActiveImage(img)}
                className={`block h-16 w-16 cursor-pointer overflow-hidden rounded-md border-2 transition-all duration-300 sm:h-19 sm:w-19 md:h-24 md:w-24 ${
                  activeImage !== img
                    ? "border-transparent opacity-55 hover:border-white/80 hover:opacity-80"
                    : "border-white opacity-100 ring-2 ring-white/40"
                }`}
                aria-label={`Show image ${index + 1}`}
                aria-current={activeImage === img ? true : undefined}
              >
                <Image
                  src={img}
                  alt=""
                  aria-hidden
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
