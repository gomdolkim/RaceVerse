/**
 * Build a Google Maps URL that opens the location.
 *
 * On desktop: opens maps.google.com in a new tab.
 * On mobile (iOS/Android): the browser intercepts and opens the Google Maps
 * native app if installed (universal links). Falls back to web map.
 */

interface MapsTarget {
  latitude?: number | null;
  longitude?: number | null;
  venue_name?: string | null;
  address?: string | null;
  city?: string | null;
  region?: string | null;
  country_name?: string | null;
  country_code?: string | null;
}

/**
 * (0, 0) is the well-known "null island" — almost always the result of a
 * failed geocode rather than a real location, so we treat it as missing.
 */
function isValidCoord(lat: unknown, lon: unknown): lat is number {
  if (typeof lat !== "number" || typeof lon !== "number") return false;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return false;
  if (Math.abs(lat) < 0.0001 && Math.abs(lon) < 0.0001) return false;
  return true;
}

export function googleMapsUrl(target: MapsTarget): string | null {
  // Prefer exact coordinates when we have them (and they aren't null island).
  if (isValidCoord(target.latitude, target.longitude)) {
    return `https://www.google.com/maps/search/?api=1&query=${target.latitude},${target.longitude}`;
  }

  // Otherwise build a textual query from the most specific parts.
  const parts = [
    target.venue_name,
    target.address,
    target.city,
    target.region,
    target.country_name ?? target.country_code,
  ]
    .filter((p): p is string => Boolean(p?.trim()))
    .map((p) => p.trim());

  if (parts.length === 0) return null;
  // Dedupe consecutive duplicates (e.g., venue_name === city).
  const unique = parts.filter((p, i) => p !== parts[i - 1]);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(unique.join(", "))}`;
}

/** True if we have any locatable data — used to decide whether to render a maps link. */
export function hasLocation(target: MapsTarget): boolean {
  return googleMapsUrl(target) !== null;
}
