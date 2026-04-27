"use client";

import type { RaceDistance } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { Award, Clock, Mountain } from "lucide-react";
import { useTranslations } from "next-intl";

function distanceColor(km: number | null | undefined): string {
  if (km === null || km === undefined) return "bg-zinc-500/15 text-zinc-300 ring-zinc-500/30";
  if (km <= 12) return "bg-sky-500/15 text-sky-300 ring-sky-500/30";
  if (km <= 22) return "bg-violet-500/15 text-violet-300 ring-violet-500/30";
  if (km <= 43) return "bg-orange-500/15 text-orange-300 ring-orange-500/30";
  return "bg-rose-500/15 text-rose-300 ring-rose-500/30";
}

export function DistanceCard({ d }: { d: RaceDistance }) {
  const t = useTranslations("race_detail");
  const tDist = useTranslations("distance_label");

  let label = d.distance_label;
  if (!label) {
    const km = d.distance_km;
    if (km === null || km === undefined) label = tDist("tba");
    else if (Math.abs(km - 42.195) < 0.5) label = tDist("marathon");
    else if (Math.abs(km - 21.0975) < 0.5) label = tDist("half");
    else if (Math.abs(km - 10) < 0.5) label = tDist("ten_k");
    else if (Math.abs(km - 5) < 0.5) label = tDist("five_k");
    else if (km > 50) label = tDist("ultra");
    else label = `${km.toFixed(km % 1 === 0 ? 0 : 1)}km`;
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface-raised p-5 transition-colors hover:border-accent/40",
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-xl tabular">{label}</h3>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] ring-1 ring-inset tabular",
            distanceColor(d.distance_km),
          )}
        >
          {d.distance_km !== null ? `${d.distance_km.toFixed(1)} km` : t("distance_tba")}
        </span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        {d.elevation_gain_m !== null && (
          <div className="flex items-center gap-2">
            <Mountain className="size-3.5 text-fg-subtle" />
            <span className="text-fg-subtle">{t("elevation_gain_short")}</span>
            <span className="ml-auto tabular text-fg">
              {t("elevation_gain_value", { n: d.elevation_gain_m })}
            </span>
          </div>
        )}
        {d.elevation_loss_m !== null && (
          <div className="flex items-center gap-2">
            <Mountain className="size-3.5 text-fg-subtle rotate-180" />
            <span className="text-fg-subtle">{t("elevation_loss_short")}</span>
            <span className="ml-auto tabular text-fg">
              {t("elevation_loss_value", { n: d.elevation_loss_m })}
            </span>
          </div>
        )}
        {d.itra_points !== null && (
          <div className="flex items-center gap-2">
            <Award className="size-3.5 text-accent" />
            <span className="text-fg-subtle">{t("itra_short")}</span>
            <span className="ml-auto tabular text-fg">{t("itra_value", { n: d.itra_points })}</span>
          </div>
        )}
        {d.utmb_index !== null && (
          <div className="flex items-center gap-2">
            <Award className="size-3.5 text-accent" />
            <span className="text-fg-subtle">{t("utmb_short")}</span>
            <span className="ml-auto tabular text-fg">{d.utmb_index}</span>
          </div>
        )}
        {d.cutoff_hours !== null && (
          <div className="flex items-center gap-2">
            <Clock className="size-3.5 text-fg-subtle" />
            <span className="text-fg-subtle">{t("cutoff_short")}</span>
            <span className="ml-auto tabular text-fg">
              {t("cutoff_hours", { n: d.cutoff_hours })}
            </span>
          </div>
        )}
        {d.start_time && (
          <div className="flex items-center gap-2">
            <Clock className="size-3.5 text-fg-subtle" />
            <span className="text-fg-subtle">{t("start_short")}</span>
            <span className="ml-auto tabular text-fg">{d.start_time.slice(0, 5)}</span>
          </div>
        )}
      </dl>
    </div>
  );
}
