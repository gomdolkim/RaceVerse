import type { RaceFilters } from "@/lib/queries/races";

export const FILTER_COOKIE = "raceverse_filter_prefs";
const ONE_YEAR = 365 * 24 * 60 * 60;

export type SavedPrefs = Pick<
  RaceFilters,
  "countries" | "types" | "onlyWithRegistration" | "dateFrom" | "dateTo"
>;

function safeParse(raw: string | undefined): SavedPrefs | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded) as SavedPrefs;
    if (typeof parsed !== "object" || parsed === null) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Read saved filter prefs from `document.cookie` (client only). */
export function readPrefsFromDocument(): SavedPrefs | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((row) => row.startsWith(`${FILTER_COOKIE}=`));
  if (!match) return null;
  return safeParse(match.split("=").slice(1).join("="));
}

/** Parse from a raw cookie string (server side, given Next.js `cookies()` value). */
export function parsePrefs(rawValue: string | undefined): SavedPrefs | null {
  return safeParse(rawValue);
}

/** Persist filter prefs to a long-lived cookie (client only). */
export function writePrefsToDocument(prefs: SavedPrefs) {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(JSON.stringify(prefs));
  document.cookie = `${FILTER_COOKIE}=${value}; max-age=${ONE_YEAR}; path=/; SameSite=Lax`;
}

export function clearPrefsCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${FILTER_COOKIE}=; max-age=0; path=/; SameSite=Lax`;
}

export function hasMeaningfulPrefs(prefs: SavedPrefs | null): boolean {
  if (!prefs) return false;
  return Boolean(
    (prefs.countries && prefs.countries.length > 0) ||
      (prefs.types && prefs.types.length > 0) ||
      prefs.onlyWithRegistration ||
      prefs.dateFrom ||
      prefs.dateTo,
  );
}
