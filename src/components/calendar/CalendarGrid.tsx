"use client";

import { CountryPicker } from "@/components/filter/CountryPicker";
import { CountryFlag } from "@/components/race/CountryFlag";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { countryName } from "@/lib/format/country";
import { formatEventDate } from "@/lib/format/date";
import { Link } from "@/lib/i18n/routing";
import { writePrefsToDocument } from "@/lib/prefs/filter-prefs";
import type { CountryStats, PrimaryType, RaceWithNextEdition } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, HelpCircle, Sparkles, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

const TYPE_BADGE: Record<PrimaryType, string> = {
  road_marathon: "bg-orange-500/15 text-orange-300 ring-orange-500/30",
  road_other: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  trail: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  ultra: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
  mixed: "bg-violet-500/15 text-violet-300 ring-violet-500/30",
  virtual: "bg-cyan-500/15 text-cyan-300 ring-cyan-500/30",
  unknown: "bg-zinc-500/15 text-zinc-300 ring-zinc-500/30",
};

const MONTH_NAMES_EN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Types shown in the calendar filter row (excludes hidden ones). */
const FILTER_TYPES: PrimaryType[] = ["road_marathon", "trail", "ultra", "mixed", "virtual"];

interface Props {
  /** Current month: 'YYYY-MM' */
  month: string;
  /** 'YYYY-MM' for prev navigation */
  prevMonth: string;
  /** 'YYYY-MM' for next navigation */
  nextMonth: string;
  /** First month with any upcoming race in DB (server-computed) */
  earliestMonth: string | null;
  /** Last month with any upcoming race in DB (server-computed) */
  latestMonth: string | null;
  /** Races for `month` only (already date-filtered by server) */
  races: RaceWithNextEdition[];
  availableCountries: CountryStats[];
  initialSelectedCountries?: string[];
  initialSelectedTypes?: string[];
}

export function CalendarGrid({
  month,
  prevMonth,
  nextMonth,
  earliestMonth,
  latestMonth,
  races,
  availableCountries,
  initialSelectedCountries = [],
  initialSelectedTypes = [],
}: Props) {
  const t = useTranslations("calendar");
  const tRaces = useTranslations("races");
  const tType = useTranslations("primary_type");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const weekdays = (t.raw("weekdays") as string[]) ?? [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ];

  const [selectedCountries, setSelectedCountries] = useState<string[]>(initialSelectedCountries);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(initialSelectedTypes);
  const [dialogDay, setDialogDay] = useState<string | null>(null);

  // Persist filter selection (cookie syncs with /races)
  // biome-ignore lint/correctness/useExhaustiveDependencies: derived joins cover deps
  useEffect(() => {
    writePrefsToDocument({
      countries: selectedCountries.length ? selectedCountries : undefined,
      types: selectedTypes.length ? (selectedTypes as PrimaryType[]) : undefined,
    });
  }, [selectedCountries.join(","), selectedTypes.join(",")]);

  // Apply country + type filters to the month's races (client-side)
  const countrySet = new Set(selectedCountries.map((c) => c.toUpperCase()));
  const typeSet = new Set(selectedTypes);
  const filteredRaces = races.filter((r) => {
    if (selectedCountries.length > 0) {
      if (!r.country_code || !countrySet.has(r.country_code.toUpperCase())) return false;
    }
    if (selectedTypes.length > 0) {
      if (!typeSet.has(r.primary_type)) return false;
    }
    return true;
  });

  // Build day → races map and grid cells from cursor month
  const [year, monthIdx] = month.split("-").map(Number);
  const cursor = new Date(year, monthIdx - 1, 1);

  const monthRaces = (() => {
    const map = new Map<string, RaceWithNextEdition[]>();
    for (const r of filteredRaces) {
      if (!r.event_date) continue;
      const list = map.get(r.event_date) ?? [];
      list.push(r);
      map.set(r.event_date, list);
    }
    return map;
  })();

  const days = (() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    const cells: { date: Date; inMonth: boolean }[] = [];
    const cur = new Date(start);
    while (cur <= last || cur.getDay() !== 0) {
      cells.push({
        date: new Date(cur),
        inMonth: cur.getMonth() === cursor.getMonth(),
      });
      cur.setDate(cur.getDate() + 1);
      if (cells.length > 42) break;
    }
    return cells;
  })();

  const monthLabel =
    locale === "en"
      ? t("month_year", {
          month: MONTH_NAMES_EN[cursor.getMonth()],
          year: cursor.getFullYear(),
        })
      : t("month_year", {
          year: cursor.getFullYear(),
          month: cursor.getMonth() + 1,
        });

  /** Navigate to a different month via URL (?month=YYYY-MM) */
  const goToMonth = (targetMonth: string) => {
    const sp = new URLSearchParams(searchParams);
    sp.set("month", targetMonth);
    startTransition(() => {
      router.replace(`?${sp.toString()}`, { scroll: false });
    });
  };

  const goPrev = () => goToMonth(prevMonth);
  const goNext = () => goToMonth(nextMonth);
  const goToday = () => {
    const d = new Date();
    goToMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  const canGoPrev = !earliestMonth || month > earliestMonth;
  const canGoNext = !latestMonth || month < latestMonth;

  const toggleCountry = (code: string) => {
    setSelectedCountries((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const totalCount = filteredRaces.length;
  const monthHasRaces = monthRaces.size > 0;

  const earliestLabel = earliestMonth ? formatMonthLabel(earliestMonth, locale) : null;

  return (
    <div className={cn(pending && "opacity-90 transition-opacity")}>
      {/* Filters: country picker + type chips + active chips + count */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <CountryPicker
            available={availableCountries}
            selected={selectedCountries}
            onToggle={toggleCountry}
            onClear={() => setSelectedCountries([])}
          />

          {/* Type chips — inline, mobile-friendly toggle */}
          <div className="flex flex-wrap items-center gap-1.5">
            {FILTER_TYPES.map((tt) => {
              const active = selectedTypes.includes(tt);
              return (
                <button
                  type="button"
                  key={tt}
                  onClick={() => toggleType(tt)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs sm:text-sm transition-colors",
                    active
                      ? "border-accent bg-accent/15 text-accent"
                      : "border-border text-fg-muted hover:border-accent/40 hover:text-fg",
                  )}
                >
                  {tType(tt)}
                </button>
              );
            })}
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <span
                tabIndex={0}
                className="inline-flex cursor-help items-center gap-1.5 rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-fg-muted hover:border-accent/40 hover:text-fg transition-colors"
                aria-label={t("filter_help")}
              >
                <HelpCircle className="size-3.5" />
                <span className="hidden md:inline">{t("filter_help_short")}</span>
                <span className="inline md:hidden">?</span>
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-[260px] text-xs leading-relaxed">
              {t("filter_help")}
            </TooltipContent>
          </Tooltip>

          <span className="ml-auto text-xs text-fg-subtle tabular">
            {tRaces("results_count", { count: totalCount })}
          </span>
        </div>

        {/* Active chips row (only when something is selected) */}
        {(selectedCountries.length > 0 || selectedTypes.length > 0) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {selectedCountries.map((c) => (
              <Badge
                key={`c-${c}`}
                variant="accent"
                className="cursor-pointer gap-1 pl-2 pr-1"
                onClick={() => toggleCountry(c)}
              >
                <CountryFlag code={c} size={12} />
                <span>{countryName(c, locale, null)}</span>
                <X className="size-3" />
              </Badge>
            ))}
            {selectedTypes.map((tt) => (
              <Badge
                key={`t-${tt}`}
                variant="accent"
                className="cursor-pointer gap-1 pl-2 pr-1"
                onClick={() => toggleType(tt)}
              >
                <span>{tType(tt as PrimaryType)}</span>
                <X className="size-3" />
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedCountries([]);
                setSelectedTypes([]);
              }}
              className="ml-auto text-xs text-fg-muted"
            >
              {tRaces("filter_clear")}
            </Button>
          </div>
        )}
      </div>

      {/* Empty-month hint */}
      {!monthHasRaces && earliestMonth && earliestMonth !== month && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-border bg-surface/40 px-4 py-3 text-sm">
          <Sparkles className="size-4 text-accent" />
          <span className="text-fg-muted">{t("no_races_in_month")}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => goToMonth(earliestMonth)}
            className="ml-auto"
          >
            {t("jump_to_next", { month: earliestLabel ?? "" })}
          </Button>
        </div>
      )}

      <motion.div
        key={month}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <header className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl tabular">{monthLabel}</h2>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="outline"
              onClick={goPrev}
              disabled={!canGoPrev || pending}
              aria-label={t("prev_month")}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={goToday} disabled={pending}>
              {t("today")}
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={goNext}
              disabled={!canGoNext || pending}
              aria-label={t("next_month")}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-border bg-border">
          {weekdays.map((d) => (
            <div
              key={d}
              className="bg-surface px-3 py-2 text-xs font-medium text-fg-muted uppercase tracking-wider tabular"
            >
              {d}
            </div>
          ))}
          {days.map((cell) => {
            const isoKey = isoDate(cell.date);
            const dayRaces = monthRaces.get(isoKey) ?? [];
            const hasRaces = dayRaces.length > 0;
            return (
              <div
                key={isoKey}
                onClick={() => hasRaces && setDialogDay(isoKey)}
                onKeyDown={(e) => {
                  if (!hasRaces) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setDialogDay(isoKey);
                  }
                }}
                role={hasRaces ? "button" : undefined}
                tabIndex={hasRaces ? 0 : undefined}
                aria-label={hasRaces ? t("open_day_view", { n: dayRaces.length }) : undefined}
                className={cn(
                  "relative flex min-h-[68px] flex-col p-2 sm:min-h-[96px] sm:p-3 transition-colors",
                  cell.inMonth ? "bg-surface-raised" : "bg-surface text-fg-subtle/50",
                  isToday(cell.date) && "ring-1 ring-inset ring-accent",
                  hasRaces
                    ? "cursor-pointer hover:bg-accent/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-bg"
                    : "",
                )}
              >
                <span
                  className={cn(
                    "text-xs tabular",
                    isToday(cell.date)
                      ? "text-accent font-semibold"
                      : cell.inMonth
                        ? "text-fg-muted"
                        : "text-fg-subtle",
                  )}
                >
                  {cell.date.getDate()}
                </span>

                {hasRaces && (
                  <div className="flex flex-1 flex-col items-center justify-center gap-1">
                    <span className="font-display text-2xl sm:text-3xl tabular text-accent leading-none">
                      {dayRaces.length}
                    </span>
                    <span className="hidden sm:block text-[10px] uppercase tracking-wider text-fg-muted">
                      {locale === "en" ? (dayRaces.length === 1 ? "race" : "races") : "대회"}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {uniqueFlags(dayRaces, 4).map((c) => (
                        <CountryFlag key={c} code={c} size={11} />
                      ))}
                      {uniqueCountries(dayRaces) > 4 && (
                        <span className="ml-0.5 text-[9px] text-fg-subtle tabular">
                          +{uniqueCountries(dayRaces) - 4}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Day detail dialog */}
      <Dialog open={dialogDay !== null} onOpenChange={(open) => !open && setDialogDay(null)}>
        <DialogContent className="max-w-2xl p-0 sm:rounded-2xl">
          {dialogDay && (
            <DayDetailContent
              isoDate={dialogDay}
              races={monthRaces.get(dialogDay) ?? []}
              locale={locale}
              onClose={() => setDialogDay(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DayDetailContent({
  isoDate,
  races,
  locale,
  onClose,
}: {
  isoDate: string;
  races: RaceWithNextEdition[];
  locale: string;
  onClose: () => void;
}) {
  const t = useTranslations("calendar");
  const tType = useTranslations("primary_type");
  const tDetail = useTranslations("race_detail");

  return (
    <>
      <DialogHeader className="border-b border-border p-5 sm:p-6">
        <DialogTitle className="font-display text-xl sm:text-2xl">
          {t("day_dialog_title", {
            date: formatEventDate(isoDate, undefined, locale),
          })}
        </DialogTitle>
        <DialogDescription className="tabular">
          {t("day_dialog_count", { n: races.length })}
        </DialogDescription>
      </DialogHeader>
      <ScrollArea className="max-h-[65vh] sm:max-h-[70vh]">
        <ul className="divide-y divide-border">
          {races.map((r) => (
            <li key={r.id}>
              <Link
                href={`/races/${r.slug}`}
                onClick={onClose}
                className="group flex items-start gap-3 px-5 py-4 sm:px-6 transition-colors hover:bg-surface-raised active:bg-surface-overlay"
              >
                <CountryFlag code={r.country_code} size={22} className="mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-fg group-hover:text-accent transition-colors line-clamp-2">
                    {r.canonical_name}
                  </p>
                  <p className="mt-0.5 text-xs text-fg-muted tabular truncate">
                    {countryName(r.country_code, locale, r.country_name)}
                    {r.city && ` · ${r.city}`}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ring-1 ring-inset",
                        TYPE_BADGE[r.primary_type],
                      )}
                    >
                      {tType(r.primary_type)}
                    </span>
                    {r.registration_url && (
                      <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] text-accent ring-1 ring-inset ring-accent/30">
                        {tDetail("registration_open")}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="size-4 mt-1 text-fg-subtle group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </>
  );
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function isToday(d: Date): boolean {
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}

function uniqueCountries(races: RaceWithNextEdition[]): number {
  const set = new Set<string>();
  for (const r of races) if (r.country_code) set.add(r.country_code);
  return set.size;
}

function uniqueFlags(races: RaceWithNextEdition[], take: number): string[] {
  const set = new Set<string>();
  const out: string[] = [];
  for (const r of races) {
    if (!r.country_code || set.has(r.country_code)) continue;
    set.add(r.country_code);
    out.push(r.country_code);
    if (out.length >= take) break;
  }
  return out;
}

function formatMonthLabel(month: string, locale: string): string {
  const [y, m] = month.split("-").map(Number);
  if (locale === "en") return `${MONTH_NAMES_EN[m - 1]} ${y}`;
  return `${y}년 ${m}월`;
}
