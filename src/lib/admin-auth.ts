import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Session } from "next-auth";

/** Guard for admin server components — redirects non-admins away. */
export async function requireAdmin(): Promise<Session> {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "admin") redirect("/");
  return session;
}

/** Guard for admin API routes — returns the session or null (caller returns 401/403). */
export async function getAdminSession(): Promise<Session | null> {
  const session = await auth();
  return session?.user?.role === "admin" ? session : null;
}
