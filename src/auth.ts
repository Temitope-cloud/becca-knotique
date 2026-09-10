import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { rateLimit } from "@/lib/rate-limit";
import { sendWelcomeEmail } from "@/lib/email";

function isAdminEmail(email?: string | null): boolean {
  const admin = process.env.ADMIN_EMAIL?.toLowerCase();
  return !!admin && !!email && email.toLowerCase() === admin;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [
    Google({
      // Lets a Google login attach to an existing account with the same email.
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email
          ? String(credentials.email).toLowerCase().trim()
          : "";
        const password = credentials?.password
          ? String(credentials.password)
          : "";
        if (!email || !password) return null;

        // Throttle password guessing against a specific account.
        const limited = await rateLimit("login", email, {
          limit: 10,
          windowMs: 15 * 60 * 1000,
        });
        if (!limited.ok) return null;

        await connectToDatabase();
        const user = await User.findOne({ email }).select("+password");
        if (!user?.password) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = user.email?.toLowerCase();
        if (!email) return false;
        await connectToDatabase();
        const existing = await User.findOne({ email });
        if (existing) return true; // known account — just sign in

        // Unknown account. Only create one if the person explicitly chose
        // "Sign up with Google". Coming from the login button must not
        // silently create an account.
        const intent = (await cookies()).get("bk_oauth_intent")?.value;
        if (intent !== "signup") {
          return "/login?error=NoAccount";
        }

        await User.create({
          name: user.name ?? "Customer",
          email,
          image: user.image ?? undefined,
          provider: "google",
          role: isAdminEmail(email) ? "admin" : "customer",
        });
        await sendWelcomeEmail(email, user.name ?? undefined);
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        // Present right after sign-in (credentials or oauth).
        token.role = user.role ?? token.role;
        if (user.id) token.id = user.id;
      }
      // Ensure we always have the DB id + role attached.
      if (token.email && (!token.id || !token.role)) {
        await connectToDatabase();
        const dbUser = await User.findOne({
          email: token.email.toLowerCase(),
        });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.role = (token.role as "customer" | "admin") ?? "customer";
      }
      return session;
    },
  },
});
