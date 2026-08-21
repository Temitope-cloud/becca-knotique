"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

interface WishlistContextValue {
  slugs: string[];
  count: number;
  has: (slug: string) => boolean;
  toggle: (slug: string) => void;
  ready: boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [slugs, setSlugs] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  // Load the signed-in user's wishlist.
  useEffect(() => {
    let cancelled = false;
    if (status === "authenticated") {
      fetch("/api/wishlist")
        .then((r) => r.json())
        .then((d) => {
          if (!cancelled) setSlugs(Array.isArray(d.slugs) ? d.slugs : []);
        })
        .catch(() => {})
        .finally(() => !cancelled && setReady(true));
    } else if (status === "unauthenticated") {
      setSlugs([]);
      setReady(true);
    }
    return () => {
      cancelled = true;
    };
  }, [status]);

  const has = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  const toggle = useCallback(
    (slug: string) => {
      if (status !== "authenticated") {
        router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
        return;
      }
      const isIn = slugs.includes(slug);
      // optimistic
      setSlugs((prev) =>
        isIn ? prev.filter((s) => s !== slug) : [...prev, slug],
      );
      fetch("/api/wishlist", {
        method: isIn ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      }).catch(() => {
        // revert on failure
        setSlugs((prev) =>
          isIn ? [...prev, slug] : prev.filter((s) => s !== slug),
        );
      });
    },
    [status, slugs, router, pathname],
  );

  const value = useMemo<WishlistContextValue>(
    () => ({ slugs, count: slugs.length, has, toggle, ready }),
    [slugs, has, toggle, ready],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
