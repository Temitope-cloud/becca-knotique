"use client";

import { useRef, useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus, X, Plus } from "lucide-react";

// NEXT_PUBLIC_* values are inlined at build time. When they're missing (e.g. not
// set on the host), we fall back to pasting an image URL instead of rendering the
// Cloudinary widget — which throws if the API key is absent.
const cloudinaryReady = Boolean(
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
);

export default function ImageUploader({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const [manualUrl, setManualUrl] = useState("");
  // Always holds the latest images so rapid multi-file uploads accumulate
  // instead of each onSuccess overwriting the last (stale-closure fix).
  const valueRef = useRef(value);
  valueRef.current = value;
  const remove = (url: string) => onChange(value.filter((u) => u !== url));

  const addManual = () => {
    const url = manualUrl.trim();
    if (url && !value.includes(url)) onChange([...value, url]);
    setManualUrl("");
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {value.map((url) => (
          <div
            key={url}
            className="group relative h-24 w-20 overflow-hidden rounded-lg border border-stone-200 bg-stone-100"
          >
            {/* plain img so any URL previews without next/image domain limits */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
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

        {cloudinaryReady ? (
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
                if (url && !valueRef.current.includes(url)) {
                  const next = [...valueRef.current, url];
                  valueRef.current = next; // accumulate across rapid callbacks
                  onChange(next);
                }
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
        ) : null}
      </div>

      {cloudinaryReady ? (
        <p className="mt-2 text-xs text-stone-400">
          First image is used as the main product photo.
        </p>
      ) : (
        <div className="mt-3">
          <div className="flex gap-2">
            <input
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addManual();
                }
              }}
              placeholder="Paste an image URL"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900"
            />
            <button
              type="button"
              onClick={addManual}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-stone-900 px-3 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-900 hover:text-white"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
          <p className="mt-2 text-xs text-amber-600">
            Image uploader is off because Cloudinary keys aren&apos;t set on this
            deployment. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and
            NEXT_PUBLIC_CLOUDINARY_API_KEY (and the server CLOUDINARY_* keys),
            then redeploy. Meanwhile you can paste image URLs. First image is the
            main photo.
          </p>
        </div>
      )}
    </div>
  );
}
