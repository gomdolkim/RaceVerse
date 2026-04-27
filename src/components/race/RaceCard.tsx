"use client";

import { Badge } from "@/components/ui/badge";
import { countryName } from "@/lib/format/country";
import { dCountdown, shortDate } from "@/lib/format/date";
import { Link } from "@/lib/i18n/routing";
import type { PrimaryType } from "@/lib/supabase/types";
import type { RaceWithNextEdition } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { CountryFlag } from "./CountryFlag";
import { SaveButton } from "./SaveButton";

const TYPE_BADGE: Record<PrimaryType, string> = {
  road_marathon: "bg-orange-500/15 text-orange-300 ring-orange-500/30",
  road_other: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  trail: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  ultra: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
  mixed: "bg-violet-500/15 text-violet-300 ring-violet-500/30",
  virtual: "bg-cyan-500/15 text-cyan-300 ring-cyan-500/30",
  unknown: "bg-zinc-500/15 text-zinc-300 ring-zinc-500/30",
};

export function RaceCard({
  race,
  index = 0,
  compact = false,
}: {
  race: RaceWithNextEdition;
  index?: number;
  compact?: boolean;
}) {
  const locale = useLocale();
  const tCard = useTranslations("race_card");
  const tType = useTranslations("primary_type");

  const dCount = dCountdown(race.event_date);
  const isUpcoming = race.event_date && new Date(race.event_date) >= new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.04, 0.3),
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -3 }}
      className="group relative"
    >
      <SaveButton raceId={race.id} variant="sm" stopPropagation />
      <Link
        href={`/races/${race.slug}`}
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface-raised transition-all duration-quick ease-out-expo",
          "hover:border-accent/50 hover:shadow-[0_8px_32px_-12px_oklch(var(--accent)/0.35)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
          compact ? "p-4" : "p-5",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-fg-muted tabular">
            <CountryFlag code={race.country_code} size={16} />
            <span>{countryName(race.country_code, locale, race.country_name)}</span>
            {race.city && <span className="text-fg-subtle">·</span>}
            {race.city && <span className="truncate max-w-[10ch]">{race.city}</span>}
          </div>
          {isUpcoming && dCount && (
            <Badge variant="accent" className="tabular shrink-0">
              {dCount}
            </Badge>
          )}
        </div>

        <h3
          className={cn(
            "mt-3 font-display tracking-tight text-fg group-hover:text-fg line-clamp-2",
            compact ? "text-base" : "text-lg",
          )}
        >
          {race.canonical_name}
        </h3>

        {!compact && race.description && (
          <p className="mt-1.5 line-clamp-2 text-sm text-fg-muted leading-relaxed">
            {race.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset",
              TYPE_BADGE[race.primary_type],
            )}
          >
            {tType(race.primary_type)}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-3 text-xs text-fg-muted tabular border-t border-border/60 pt-3">
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3.5" />
            {race.event_date ? shortDate(race.event_date, locale) : tCard("tba_date")}
          </span>
          {race.region && (
            <span className="inline-flex items-center gap-1 truncate">
              <MapPin className="size-3.5" />
              <span className="truncate">{race.region}</span>
            </span>
          )}
          {race.registration_url && (
            <span className="ml-auto inline-flex items-center gap-1 text-accent">
              <Ticket className="size-3.5" />
              {tCard("register")}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
