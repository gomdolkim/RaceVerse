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

export function googleMapsUrl(target: MapsTarget): string | null {
  // Prefer exact coordinates when we have them.
  if (
    target.latitude != null &&
    target.longitude != null &&
    Number.isFinite(target.latitude) &&
    Number.isFinite(target.longitude)
  ) {
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
    .filter((p): p is string => Boolean(p && p.trim()))
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
