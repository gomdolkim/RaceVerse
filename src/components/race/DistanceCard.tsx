import { distanceColor, distanceLabelKo } from "@/lib/format/race";
import type { RaceDistance } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { Award, Clock, Mountain } from "lucide-react";

export function DistanceCard({ d }: { d: RaceDistance }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface-raised p-5 transition-colors hover:border-accent/40",
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-xl tabular">
          {d.distance_label || distanceLabelKo(d.distance_km)}
        </h3>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] ring-1 ring-inset tabular",
            distanceColor(d.distance_km),
          )}
        >
          {d.distance_km !== null ? `${d.distance_km.toFixed(1)} km` : "거리 미정"}
        </span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        {d.elevation_gain_m !== null && (
          <div className="flex items-center gap-2">
            <Mountain className="size-3.5 text-fg-subtle" />
            <span className="text-fg-subtle">상승</span>
            <span className="ml-auto tabular text-fg">+{d.elevation_gain_m}m</span>
          </div>
        )}
        {d.elevation_loss_m !== null && (
          <div className="flex items-center gap-2">
            <Mountain className="size-3.5 text-fg-subtle rotate-180" />
            <span className="text-fg-subtle">하강</span>
            <span className="ml-auto tabular text-fg">−{d.elevation_loss_m}m</span>
          </div>
        )}
        {d.itra_points !== null && (
          <div className="flex items-center gap-2">
            <Award className="size-3.5 text-accent" />
            <span className="text-fg-subtle">ITRA</span>
            <span className="ml-auto tabular text-fg">{d.itra_points}P</span>
          </div>
        )}
        {d.utmb_index !== null && (
          <div className="flex items-center gap-2">
            <Award className="size-3.5 text-accent" />
            <span className="text-fg-subtle">UTMB</span>
            <span className="ml-auto tabular text-fg">{d.utmb_index}</span>
          </div>
        )}
        {d.cutoff_hours !== null && (
          <div className="flex items-center gap-2">
            <Clock className="size-3.5 text-fg-subtle" />
            <span className="text-fg-subtle">제한</span>
            <span className="ml-auto tabular text-fg">{d.cutoff_hours}시간</span>
          </div>
        )}
        {d.start_time && (
          <div className="flex items-center gap-2">
            <Clock className="size-3.5 text-fg-subtle" />
            <span className="text-fg-subtle">출발</span>
            <span className="ml-auto tabular text-fg">{d.start_time.slice(0, 5)}</span>
          </div>
        )}
      </dl>
    </div>
  );
}
