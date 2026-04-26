import { Badge } from "@/components/ui/badge";
import { distanceColor, distanceLabelKo } from "@/lib/format/race";
import { cn } from "@/lib/utils";

export function DistanceBadge({
  distanceKm,
  label,
  className,
}: {
  distanceKm?: number | null;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs ring-1 ring-inset tabular",
        distanceColor(distanceKm),
        className,
      )}
    >
      {label ?? distanceLabelKo(distanceKm)}
    </span>
  );
}
