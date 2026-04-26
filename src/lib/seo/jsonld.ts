import type { RaceWithNextEdition } from "@/lib/supabase/types";

export function raceEventJsonLd(race: RaceWithNextEdition, siteUrl: string) {
  const url = `${siteUrl.replace(/\/$/, "")}/races/${race.slug}`;
  const json: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: race.canonical_name,
    url,
    sport:
      race.primary_type === "trail" || race.primary_type === "ultra" ? "Trail running" : "Marathon",
  };
  if (race.event_date) json.startDate = race.event_date;
  if (race.event_end_date) json.endDate = race.event_end_date;
  if (race.description) json.description = race.description;
  if (race.organizer_name) {
    json.organizer = {
      "@type": "Organization",
      name: race.organizer_name,
      ...(race.organizer_website ? { url: race.organizer_website } : {}),
    };
  }
  const locParts: Record<string, unknown> = {
    "@type": "Place",
    name: race.venue_name ?? race.city ?? race.canonical_name,
  };
  if (race.country_name || race.country_code) {
    locParts.address = {
      "@type": "PostalAddress",
      addressCountry: race.country_code,
      addressRegion: race.region ?? undefined,
      addressLocality: race.city ?? undefined,
    };
  }
  if (race.latitude && race.longitude) {
    locParts.geo = {
      "@type": "GeoCoordinates",
      latitude: race.latitude,
      longitude: race.longitude,
    };
  }
  json.location = locParts;
  if (race.registration_url) {
    json.offers = {
      "@type": "Offer",
      url: race.registration_url,
      price: race.price_amount ?? undefined,
      priceCurrency: race.price_currency ?? undefined,
      validFrom: race.registration_opens_at ?? undefined,
      availability: "https://schema.org/InStock",
    };
  }
  return json;
}
