"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Heart } from "lucide-react";

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

  // Lightweight toast so wishlist actions have clear, visible feedback
  // (the filling heart alone is easy to miss, especially on mobile).
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((text: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text });
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);
  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

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
        showToast("Sign in to save items to your wishlist");
        router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
        return;
      }
      const isIn = slugs.includes(slug);
      // optimistic
      setSlugs((prev) =>
        isIn ? prev.filter((s) => s !== slug) : [...prev, slug],
      );
      showToast(isIn ? "Removed from wishlist" : "Saved to wishlist");
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
    [status, slugs, router, pathname, showToast],
  );

  const value = useMemo<WishlistContextValue>(
    () => ({ slugs, count: slugs.length, has, toggle, ready }),
    [slugs, has, toggle, ready],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
      {toast ? (
        <div
          key={toast.id}
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 bottom-6 z-[200] flex justify-center px-4"
        >
          <div className="flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg wishlist-toast-in">
            <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
            {toast.text}
          </div>
        </div>
      ) : null}
      <style>{`
        @keyframes wishlist-toast-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .wishlist-toast-in { animation: wishlist-toast-in 0.22s ease-out; }
      `}</style>
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
