"use client";

import { HeroBackdrop } from "@/components/layout/HeroBackdrop";
import { Badge } from "@/components/ui/badge";
import { countryName } from "@/lib/format/country";
import { dCountdown, formatDateRange, formatEventDate } from "@/lib/format/date";
import { googleMapsUrl } from "@/lib/format/maps";
import type { RaceWithNextEdition } from "@/lib/supabase/types";
import { Calendar, ExternalLink, MapPin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { CountryFlag } from "./CountryFlag";
import { SaveButton } from "./SaveButton";

export function RaceHero({ race }: { race: RaceWithNextEdition }) {
  const locale = useLocale();
  const t = useTranslations("race_detail");
  const tType = useTranslations("primary_type");
  const countdown = dCountdown(race.event_date);

  const mapsUrl = googleMapsUrl({
    latitude: race.latitude,
    longitude: race.longitude,
    venue_name: race.venue_name,
    city: race.city,
    region: race.region,
    country_name: race.country_name,
    country_code: race.country_code,
  });

  // Country / region / city — most general → most specific.
  const locationParts = [
    countryName(race.country_code, locale, race.country_name),
    race.region,
    race.city,
  ].filter(Boolean) as string[];

  return (
    <section className="relative isolate overflow-hidden border-b border-border noise">
      <HeroBackdrop />
      <div className="container-wide relative z-10 pt-12 pb-12 sm:pt-20 sm:pb-16">
        {/* Country/region/city row — clickable to Google Maps when we know where */}
        {mapsUrl ? (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("open_in_maps")}
            className="group inline-flex flex-wrap items-center gap-1 rounded-md text-sm text-fg-muted tabular transition-colors hover:text-accent"
          >
            <CountryFlag code={race.country_code} size={20} />
            <span className="ml-1">
              {locationParts.map((p, i) => (
                <span key={`${i}-${p}`}>
                  {i > 0 && <span className="text-fg-subtle"> · </span>}
                  {p}
                </span>
              ))}
            </span>
            <ExternalLink className="size-3 opacity-0 transition-opacity group-hover:opacity-70" />
          </a>
        ) : (
          <div className="flex flex-wrap items-center gap-1 text-sm text-fg-muted tabular">
            <CountryFlag code={race.country_code} size={20} />
            <span className="ml-1">
              {locationParts.map((p, i) => (
                <span key={`${i}-${p}`}>
                  {i > 0 && <span className="text-fg-subtle"> · </span>}
                  {p}
                </span>
              ))}
            </span>
          </div>
        )}

        <h1 className="mt-3 max-w-4xl font-display text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          {race.canonical_name}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Badge variant="accent">{tType(race.primary_type)}</Badge>
          {countdown && (
            <Badge variant="outline" className="tabular">
              {countdown}
            </Badge>
          )}
          {race.edition_year && (
            <Badge variant="outline" className="tabular">
              {race.edition_year}
            </Badge>
          )}
          <SaveButton raceId={race.id} variant="pill" className="ml-1" />
        </div>

        {/*
         * Detail row — uses divs instead of dl/dd because we want to mix
         * regular cells with anchor cells (Maps link), and a/dl/dd nesting
         * isn't valid HTML.
         */}
        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <div className="flex items-center gap-2 text-fg-muted">
            <Calendar className="size-4 text-fg-subtle" />
            <span className="text-fg tabular">
              {race.event_date
                ? formatDateRange(race.event_date, race.event_end_date, locale)
                : t("tba_date")}
            </span>
          </div>
          {race.venue_name && mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("open_in_maps")}
              className="group inline-flex items-center gap-2 rounded-md text-fg-muted transition-colors hover:text-accent"
            >
              <MapPin className="size-4 text-fg-subtle group-hover:text-accent" />
              <span className="text-fg group-hover:text-accent">{race.venue_name}</span>
              <ExternalLink className="size-3 opacity-0 transition-opacity group-hover:opacity-70" />
            </a>
          )}
          {race.venue_name && !mapsUrl && (
            <div className="flex items-center gap-2 text-fg-muted">
              <MapPin className="size-4 text-fg-subtle" />
              <span className="text-fg">{race.venue_name}</span>
            </div>
          )}
          {race.first_held_year && (
            <div className="flex items-center gap-2 text-fg-muted">
              <span className="text-fg-subtle">{t("first_held")}</span>
              <span className="text-fg tabular">
                {t("first_held_value", { year: race.first_held_year })}
              </span>
            </div>
          )}
          {/* Maps CTA — always visible when we know any locatable info */}
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("open_in_maps")}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/40 px-3 py-1 text-fg-muted transition-colors hover:border-accent/40 hover:bg-surface-overlay hover:text-accent"
            >
              <MapPin className="size-3.5" />
              <span className="text-xs">{t("open_in_maps")}</span>
              <ExternalLink className="size-3 opacity-60" />
            </a>
          )}
        </div>

        {race.description && (
          <p className="mt-6 max-w-3xl text-pretty leading-relaxed text-fg-muted">
            {race.description}
          </p>
        )}

        <p className="sr-only">
          {race.canonical_name} - {countryName(race.country_code, locale, race.country_name)} -{" "}
          {race.event_date ? formatEventDate(race.event_date, undefined, locale) : t("tba_date")}
        </p>
      </div>
    </section>
  );
}
