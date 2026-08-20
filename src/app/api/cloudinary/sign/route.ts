import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

/**
 * Signs Cloudinary upload params for the admin's browser (CldUploadWidget with
 * signatureEndpoint). Admin only. The file uploads straight to Cloudinary;
 * it never passes through our server.
 */
export async function POST(request: Request) {
  if (!(await getAdminSession())) {
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
  const paramsToSign = body?.paramsToSign;
  if (!paramsToSign || typeof paramsToSign !== "object") {
    return NextResponse.json(
      { error: "Missing paramsToSign" },
      { status: 400 },
    );
  }

  const signature = cld.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET as string,
  );

  return NextResponse.json({ signature });
}
