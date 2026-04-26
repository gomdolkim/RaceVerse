// Minimal RFC 5545 .ics builder for race events.

import type { RaceWithNextEdition } from "@/lib/supabase/types";

function escape(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function fmtDate(iso: string): string {
  // YYYY-MM-DD → YYYYMMDD (DTSTART;VALUE=DATE)
  return iso.replace(/-/g, "");
}

export function buildIcs(race: RaceWithNextEdition, siteUrl: string): string {
  const start = race.event_date;
  const end = race.event_end_date ?? race.event_date;
  if (!start || !end) {
    throw new Error("Race has no event_date");
  }
  const uid = `race-${race.id}@raceverse.app`;
  const dtStamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

  const location = [race.city, race.country_name ?? race.country_code].filter(Boolean).join(", ");

  const url = `${siteUrl.replace(/\/$/, "")}/races/${race.slug}`;
  const description = race.description ? escape(race.description.slice(0, 1000)) : "";

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RaceVerse//RaceVerse 1.0//KO",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART;VALUE=DATE:${fmtDate(start)}`,
    `DTEND;VALUE=DATE:${fmtDate(end)}`,
    `SUMMARY:${escape(race.canonical_name)}`,
    location ? `LOCATION:${escape(location)}` : "",
    description ? `DESCRIPTION:${description}` : "",
    `URL:${url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}
