/**
 * Shopping personalization — single source of truth for how a shopper's
 * preference maps to the product `madefor` audience. Pure and dependency-free,
 * safe to import on both server and client.
 */

export type ShoppingPreference = "her" | "him" | "all" | "gift";
export type ProductAudience = "women" | "men" | "unisex";

export const PREFERENCE_COOKIE = "bk_shopping_for";
export const SHOPPING_PREFERENCES: ShoppingPreference[] = [
  "her",
  "him",
  "all",
  "gift",
];

export function isPreference(value: unknown): value is ShoppingPreference {
  return (
    value === "her" || value === "him" || value === "all" || value === "gift"
  );
}

/**
 * Which `madefor` audiences to show for a preference. `null` means "everything"
 * (used for both "all" and, for now, "gift"). "her" and "him" include unisex.
 */
export function audiencesFor(pref: ShoppingPreference): ProductAudience[] | null {
  if (pref === "her") return ["women", "unisex"];
  if (pref === "him") return ["men", "unisex"];
  return null; // all + gift → the whole catalogue
}

/** Whether a product's audience should be shown for this preference. */
export function matchesPreference(
  madefor: string | undefined,
  pref: ShoppingPreference,
): boolean {
  const aud = audiencesFor(pref);
  if (!aud) return true;
  return aud.includes((madefor ?? "unisex") as ProductAudience);
}

/**
 * Stable sort putting products that match the preference first, without
 * dropping anything (we personalize order, never hide the catalogue).
 */
export function sortByPreference<T extends { madefor?: string }>(
  items: T[],
  pref: ShoppingPreference,
): T[] {
  const aud = audiencesFor(pref);
  if (!aud) return items;
  return items
    .map((item, i) => ({ item, i }))
    .sort((a, b) => {
      const am = matchesPreference(a.item.madefor, pref) ? 0 : 1;
      const bm = matchesPreference(b.item.madefor, pref) ? 0 : 1;
      return am - bm || a.i - b.i; // stable
    })
    .map((x) => x.item);
}

/** The value the shop's gender filter should default to. */
export function genderFilterFor(pref: ShoppingPreference): string {
  if (pref === "her") return "women";
  if (pref === "him") return "men";
  return "all"; // all + gift
}

/** Short label for the contextual selector. */
export function labelFor(pref: ShoppingPreference): string {
  if (pref === "her") return "Her";
  if (pref === "him") return "Him";
  if (pref === "gift") return "A gift";
  return "Everyone";
}

/** Subtle, on-brand hero eyebrow. `null` keeps the default hero. */
export function heroEyebrowFor(pref: ShoppingPreference | null): string | null {
  if (pref === "her") return "The edit, for her";
  if (pref === "him") return "The edit, for him";
  if (pref === "gift") return "Find a gift they'll keep";
  return null;
}
