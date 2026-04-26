"use client";

import { CountUp } from "@/components/motion/CountUp";
import { useTranslations } from "next-intl";

export function StatsRow({
  races,
  geocoded,
  countries,
  withRegistration,
}: {
  races: number;
  geocoded: number;
  countries: number;
  withRegistration: number;
}) {
  const t = useTranslations("home");
  const items = [
    { label: t("stats_races"), value: races, suffix: "+" },
    { label: t("stats_locations"), value: geocoded, suffix: "+" },
    { label: t("stats_countries"), value: countries, suffix: "" },
    { label: t("stats_with_registration"), value: withRegistration, suffix: "+" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-border bg-border">
      {items.map((s) => (
        <div
          key={s.label}
          className="bg-surface-raised p-5 sm:p-6 flex flex-col gap-1 transition-colors hover:bg-surface-overlay"
        >
          <span className="font-display text-2xl sm:text-3xl text-fg tabular">
            <CountUp value={s.value} suffix={s.suffix} />
          </span>
          <span className="text-xs text-fg-muted">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
