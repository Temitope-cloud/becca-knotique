import "server-only";
import { connectToDatabase } from "@/lib/db";
import { RateLimit } from "@/lib/models/RateLimit";

export interface RateLimitResult {
  ok: boolean;
  /** seconds until the window resets (0 when allowed) */
  retryAfter: number;
}

/**
 * Fixed-window rate limiter backed by MongoDB (works across serverless
 * instances, no external service). Fails OPEN: if the store is briefly
 * unreachable we never lock real users out.
 */
export async function rateLimit(
  action: string,
  identifier: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): Promise<RateLimitResult> {
  try {
    await connectToDatabase();
    const now = Date.now();
    const bucket = Math.floor(now / windowMs);
    const _id = `${action}:${identifier}:${bucket}`;
    const expiresAt = new Date((bucket + 1) * windowMs);

    const doc = await RateLimit.findByIdAndUpdate(
      _id,
      { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
      { upsert: true, new: true },
    );

    const count = doc?.count ?? 1;
    if (count <= limit) return { ok: true, retryAfter: 0 };
    return {
      ok: false,
      retryAfter: Math.max(1, Math.ceil((expiresAt.getTime() - now) / 1000)),
    };
  } catch {
    return { ok: true, retryAfter: 0 };
  }
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") || "unknown";
}
