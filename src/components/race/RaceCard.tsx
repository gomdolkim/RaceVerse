"use client";

import { Badge } from "@/components/ui/badge";
import { countryNameKo } from "@/lib/format/country";
import { dCountdown, formatEventDate } from "@/lib/format/date";
import { PRIMARY_TYPE_BADGE, PRIMARY_TYPE_LABEL_KO } from "@/lib/format/race";
import { Link } from "@/lib/i18n/routing";
import type { RaceWithNextEdition } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { CountryFlag } from "./CountryFlag";
import { DistanceBadge } from "./DistanceBadge";

export function RaceCard({
  race,
  index = 0,
  compact = false,
}: {
  race: RaceWithNextEdition;
  index?: number;
  compact?: boolean;
}) {
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
      className="group"
    >
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
            <span>{countryNameKo(race.country_code, race.country_name)}</span>
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
            "mt-3 font-display tracking-tight text-fg group-hover:text-fg",
            "line-clamp-2",
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
              PRIMARY_TYPE_BADGE[race.primary_type],
            )}
          >
            {PRIMARY_TYPE_LABEL_KO[race.primary_type]}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-3 text-xs text-fg-muted tabular border-t border-border/60 pt-3">
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3.5" />
            {race.event_date ? formatEventDate(race.event_date, "yyyy.MM.dd") : "일정 미정"}
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
              등록
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
