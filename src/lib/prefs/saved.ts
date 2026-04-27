/**
 * Saved races — user-curated bookmark list, persisted as a long-lived cookie.
 *
 * Stored as JSON-encoded array of race UUIDs. Capped to MAX_SAVED to keep
 * the cookie under the 4 KB browser limit (a UUID is 36 chars, so 200 items
 * ≈ 7,400 chars before encoding — we cap conservatively well below that).
 *
 * Mirrors the patterns in `interests.ts` and `filter-prefs.ts`.
 */
export const SAVED_COOKIE = "raceverse_saved_races";
const ONE_YEAR = 365 * 24 * 60 * 60;
export const MAX_SAVED = 100;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidId(v: unknown): v is string {
  return typeof v === "string" && UUID_RE.test(v);
}

function safeParse(raw: string | undefined): string[] | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded);
    if (!Array.isArray(parsed)) return null;
    // Defensive: drop anything that isn't a UUID string.
    const ids = parsed.filter(isValidId);
    return ids;
  } catch {
    return null;
  }
}

/** Server-side: parse from a Next.js cookie value. */
export function parseSaved(rawValue: string | undefined): string[] {
  return safeParse(rawValue) ?? [];
}

/** Client-side: read from `document.cookie`. */
export function readSavedFromDocument(): string[] {
  if (typeof document === "undefined") return [];
  const match = document.cookie.split("; ").find((row) => row.startsWith(`${SAVED_COOKIE}=`));
  if (!match) return [];
  return safeParse(match.split("=").slice(1).join("=")) ?? [];
}

/** Client-side: write to a long-lived cookie. */
export function writeSavedToDocument(ids: string[]) {
  if (typeof document === "undefined") return;
  // Cap + dedupe + validate before serializing.
  const seen = new Set<string>();
  const cleaned: string[] = [];
  for (const id of ids) {
    if (!isValidId(id)) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    cleaned.push(id);
    if (cleaned.length >= MAX_SAVED) break;
  }
  const value = encodeURIComponent(JSON.stringify(cleaned));
  document.cookie = `${SAVED_COOKIE}=${value}; max-age=${ONE_YEAR}; path=/; SameSite=Lax`;
}

/** Toggle a race in the saved list — returns the updated list. */
export function toggleSaved(current: string[], id: string): string[] {
  if (!isValidId(id)) return current;
  if (current.includes(id)) return current.filter((x) => x !== id);
  // New saves go to the front so /saved shows newest-first.
  return [id, ...current].slice(0, MAX_SAVED);
}

export function clearSavedCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${SAVED_COOKIE}=; max-age=0; path=/; SameSite=Lax`;
}

/** Parse comma-separated ids from a URL `?ids=A,B,C` param — for share links. */
export function parseIdsParam(value: string | undefined | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(isValidId)
    .slice(0, MAX_SAVED);
}
