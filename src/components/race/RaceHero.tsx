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

  // Location chip text — venue > city > region > country (most specific wins)
  const locationParts = [
    countryName(race.country_code, locale, race.country_name),
    race.region,
    race.city,
  ].filter(Boolean);

  const LocationLink = ({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) =>
    mapsUrl ? (
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`group inline-flex items-center gap-1 rounded-md transition-colors hover:text-accent ${className}`}
        aria-label={t("open_in_maps")}
      >
        {children}
      </a>
    ) : (
      <span className={className}>{children}</span>
    );

  return (
    <section className="relative isolate overflow-hidden border-b border-border noise">
      <HeroBackdrop />
      <div className="container-wide relative z-10 pt-12 pb-12 sm:pt-20 sm:pb-16">
        <LocationLink className="text-sm text-fg-muted tabular">
          <CountryFlag code={race.country_code} size={20} />
          <span className="ml-1">
            {locationParts.map((p, i) => (
              <span key={`${p}-${i}`}>
                {i > 0 && <span className="text-fg-subtle"> · </span>}
                {p}
              </span>
            ))}
          </span>
          {mapsUrl && (
            <ExternalLink className="size-3 opacity-0 transition-opacity group-hover:opacity-70" />
          )}
        </LocationLink>

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
        </div>

        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <div className="flex items-center gap-2 text-fg-muted">
            <Calendar className="size-4 text-fg-subtle" />
            <dd className="text-fg tabular">
              {race.event_date
                ? formatDateRange(race.event_date, race.event_end_date, locale)
                : t("tba_date")}
            </dd>
          </div>
          {race.venue_name && (
            <LocationLink>
              <MapPin className="size-4 text-fg-subtle group-hover:text-accent" />
              <dd className="text-fg">{race.venue_name}</dd>
            </LocationLink>
          )}
          {race.first_held_year && (
            <div className="flex items-center gap-2 text-fg-muted">
              <span className="text-fg-subtle">{t("first_held")}</span>
              <dd className="text-fg tabular">
                {t("first_held_value", { year: race.first_held_year })}
              </dd>
            </div>
          )}
          {/* Always-visible "Open in Maps" CTA when we have any locatable data */}
          {mapsUrl && (
            <LocationLink className="rounded-full border border-border bg-surface/40 px-3 py-1 text-fg-muted hover:bg-surface-overlay hover:border-accent/40 hover:text-accent">
              <MapPin className="size-3.5" />
              <span className="text-xs">{t("open_in_maps")}</span>
              <ExternalLink className="size-3 opacity-60" />
            </LocationLink>
          )}
        </dl>

        {race.description && (
          <p className="mt-6 max-w-3xl text-pretty leading-relaxed text-fg-muted">
            {race.description}
          </p>
        )}

        <p className="sr-only">
          {race.canonical_name} -{" "}
          {countryName(race.country_code, locale, race.country_name)} -{" "}
          {race.event_date ? formatEventDate(race.event_date, undefined, locale) : t("tba_date")}
        </p>
      </div>
    </section>
  );
}
