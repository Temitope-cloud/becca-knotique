"use client";

import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus, X } from "lucide-react";

export default function ImageUploader({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const remove = (url: string) => onChange(value.filter((u) => u !== url));

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {value.map((url) => (
          <div
            key={url}
            className="group relative h-24 w-20 overflow-hidden rounded-lg border border-stone-200 bg-stone-100"
          >
            <Image
              src={url}
              alt=""
              fill
              sizes="80px"
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => remove(url)}
              aria-label="Remove image"
              className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        <CldUploadWidget
          signatureEndpoint="/api/cloudinary/sign"
          options={{
            folder: "beccas-knotique/products",
            multiple: true,
            maxFiles: 8,
            sources: ["local", "url", "camera"],
            clientAllowedFormats: ["png", "jpeg", "jpg", "webp"],
          }}
          onSuccess={(result) => {
            const info = result?.info;
            if (info && typeof info === "object" && "secure_url" in info) {
              const url = (info as { secure_url: string }).secure_url;
              if (url && !value.includes(url)) onChange([...value, url]);
            }
          }}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              className="flex h-24 w-20 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-stone-300 text-stone-500 transition hover:border-stone-500 hover:text-stone-700"
            >
              <ImagePlus className="h-5 w-5" />
              <span className="text-[10px] font-medium">Upload</span>
            </button>
          )}
        </CldUploadWidget>
      </div>
      <p className="mt-2 text-xs text-stone-400">
        First image is used as the main product photo.
      </p>
    </div>
  );
}
