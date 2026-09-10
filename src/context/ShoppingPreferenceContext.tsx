"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  PREFERENCE_COOKIE,
  type ShoppingPreference,
} from "@/lib/audience";

interface ShoppingPreferenceValue {
  /** null until the shopper has chosen (drives the first-visit intro) */
  preference: ShoppingPreference | null;
  hasChosen: boolean;
  setPreference: (pref: ShoppingPreference) => void;
}

const ShoppingPreferenceContext =
  createContext<ShoppingPreferenceValue | null>(null);

/**
 * The cookie is the source of truth. The server reads it and passes `initial`
 * so server and client render the same value (no hydration mismatch), and the
 * intro only shows when it's null.
 */
export function ShoppingPreferenceProvider({
  children,
  initial,
}: {
  children: React.ReactNode;
  initial: ShoppingPreference | null;
}) {
  const router = useRouter();
  const [preference, setPref] = useState<ShoppingPreference | null>(initial);

  const setPreference = useCallback(
    (pref: ShoppingPreference) => {
      try {
        document.cookie = `${PREFERENCE_COOKIE}=${pref}; path=/; max-age=${
          60 * 60 * 24 * 365
        }; samesite=lax`;
      } catch {}
      setPref(pref);
      // Re-render server components (personalized hero, featured order, shop)
      // with the new preference. Client state (cart, etc.) is preserved.
      router.refresh();
    },
    [router],
  );

  return (
    <ShoppingPreferenceContext.Provider
      value={{ preference, hasChosen: preference !== null, setPreference }}
    >
      {children}
    </ShoppingPreferenceContext.Provider>
  );
}

export function useShoppingPreference(): ShoppingPreferenceValue {
  const ctx = useContext(ShoppingPreferenceContext);
  if (!ctx) {
    throw new Error(
      "useShoppingPreference must be used within ShoppingPreferenceProvider",
    );
  }
  return ctx;
}
