"use client";

import type { RaceWithNextEdition } from "@/lib/supabase/types";
import { useTranslations } from "next-intl";
import { RaceCard } from "./RaceCard";

export function RelatedRaces({ races }: { races: RaceWithNextEdition[] }) {
  const t = useTranslations("race_detail");
  if (!races.length) return null;
  return (
    <section className="mt-16">
      <h2 className="font-display text-2xl tracking-tight">{t("related_races")}</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {races.slice(0, 6).map((r, i) => (
          <RaceCard key={r.id} race={r} index={i} compact />
        ))}
      </div>
    </section>
  );
}
