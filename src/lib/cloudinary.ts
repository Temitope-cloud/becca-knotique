import "server-only";
import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary config. Returns null until the three CLOUDINARY_* env vars are set,
 * so nothing breaks before it's configured.
 */
let configured = false;

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

export function getCloudinary(): typeof cloudinary | null {
  if (!isCloudinaryConfigured()) return null;
  if (!configured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}
