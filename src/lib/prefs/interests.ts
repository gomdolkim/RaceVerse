/**
 * Long-term "interest countries" preference — used by the home page to
 * personalize what races are shown at the top.
 *
 * Values:
 *  - `null`        cookie not set yet (first-time visitor → show CTA)
 *  - `[]`          user explicitly skipped (don't nag again)
 *  - `["KR", ...]` user picked these — show races for them at home top
 */
export const INTERESTS_COOKIE = "raceverse_interests";
const ONE_YEAR = 365 * 24 * 60 * 60;

function safeParse(raw: string | undefined): string[] | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((v): v is string => typeof v === "string").map((v) => v.toUpperCase());
  } catch {
    return null;
  }
}

/** Server-side: parse from a Next.js cookie value. */
export function parseInterests(rawValue: string | undefined): string[] | null {
  return safeParse(rawValue);
}

/** Client-side: read from `document.cookie`. */
export function readInterestsFromDocument(): string[] | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((row) => row.startsWith(`${INTERESTS_COOKIE}=`));
  if (!match) return null;
  return safeParse(match.split("=").slice(1).join("="));
}

/** Client-side: write to a long-lived cookie. */
export function writeInterestsToDocument(codes: string[]) {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(JSON.stringify(codes.map((c) => c.toUpperCase())));
  document.cookie = `${INTERESTS_COOKIE}=${value}; max-age=${ONE_YEAR}; path=/; SameSite=Lax`;
}

export function clearInterestsCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${INTERESTS_COOKIE}=; max-age=0; path=/; SameSite=Lax`;
}
