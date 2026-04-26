import type { RaceWithNextEdition } from "@/lib/supabase/types";
import { RaceCard } from "./RaceCard";

export function RaceList({
  races,
  compact,
}: {
  races: RaceWithNextEdition[];
  compact?: boolean;
}) {
  if (!races.length) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {races.map((r, i) => (
        <RaceCard key={r.id} race={r} index={i} compact={compact} />
      ))}
    </div>
  );
}
