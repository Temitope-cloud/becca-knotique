import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

/**
 * Returns a short-lived signature so an admin can upload an image straight to
 * Cloudinary from the browser (no file passes through our server). Admin only.
 *
 * Client flow: POST here -> receive { signature, timestamp, apiKey, cloudName,
 * folder } -> POST the file + those fields to
 * https://api.cloudinary.com/v1_1/<cloudName>/image/upload
 */
export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cld = getCloudinary();
  if (!cld) {
    return NextResponse.json(
      { error: "Cloudinary is not configured yet." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const folder =
    typeof body?.folder === "string" ? body.folder : "beccas-knotique/products";
  const timestamp = Math.round(Date.now() / 1000);

  const signature = cld.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET as string,
  );

  return NextResponse.json({
    signature,
    timestamp,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
}
