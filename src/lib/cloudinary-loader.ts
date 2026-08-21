/**
 * Custom next/image loader — serves images straight from Cloudinary with
 * Cloudinary's own optimization (f_auto, q_auto, width), instead of proxying
 * through Vercel's /_next/image optimizer. Non-Cloudinary sources pass through
 * untouched.
 */
export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (!src.includes("res.cloudinary.com") || !src.includes("/upload/")) {
    return src;
  }
  const transforms = [
    "f_auto",
    `q_${quality ?? "auto"}`,
    `w_${width}`,
    "c_limit",
  ].join(",");
  // Insert transforms right after the first /upload/ segment.
  return src.replace("/upload/", `/upload/${transforms}/`);
}
