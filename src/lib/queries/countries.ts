import "server-only";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { CountryStats, RaceWithNextEdition } from "@/lib/supabase/types";

const HIDDEN_TYPES_PG = "(unknown,road_other)";
const PAGE = 1000;
const HARD_CAP = 20000;

/**
 * Aggregate country stats DIRECTLY from `races_public`, bypassing the
 * `country_stats` view. This guarantees the counts on /countries, /races
 * filters, /calendar filters, and the home strip ALL match the same set
 * of races that show on the map and detail pages — independent of whether
 * migration 006 has been re-applied to the live DB.
 */
export async function listCountries(): Promise<CountryStats[]> {
  const supabase = await createSupabaseServer();
  type Row = {
    country_code: string | null;
    country_name: string | null;
    primary_type: string;
    latitude: number | null;
  };

  const aggregates = new Map<string, CountryStats>();
  let offset = 0;
  while (offset < HARD_CAP) {
    const { data, error } = await supabase
      .from("races_public")
      .select("country_code, country_name, primary_type, latitude")
      .eq("is_active", true)
      .not("primary_type", "in", HIDDEN_TYPES_PG)
      .not("country_code", "is", null)
      .range(offset, offset + PAGE - 1);
    if (error) throw error;
    const batch = (data ?? []) as Row[];
    for (const r of batch) {
      if (!r.country_code) continue;
      const code = r.country_code.toUpperCase();
      const existing = aggregates.get(code) ?? {
        country_code: code,
        country_name: r.country_name,
        race_count: 0,
        marathon_count: 0,
        trail_count: 0,
        geocoded_count: 0,
      };
      existing.race_count++;
      if (r.primary_type === "road_marathon") existing.marathon_count++;
      if (r.primary_type === "trail" || r.primary_type === "ultra") existing.trail_count++;
      if (r.latitude != null) existing.geocoded_count++;
      // Prefer first non-null country_name we see
      if (!existing.country_name && r.country_name) existing.country_name = r.country_name;
      aggregates.set(code, existing);
    }
    if (batch.length < PAGE) break;
    offset += PAGE;
  }

  return [...aggregates.values()]
    .filter((c) => c.race_count > 0)
    .sort((a, b) => b.race_count - a.race_count);
}

export async function getCountry(code: string): Promise<CountryStats | null> {
  const all = await listCountries();
  return all.find((c) => c.country_code === code.toUpperCase()) ?? null;
}

export async function getRacesByCountry(
  code: string,
  limit = 24,
  offset = 0,
): Promise<RaceWithNextEdition[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("race_with_next_edition")
    .select("*")
    .eq("country_code", code.toUpperCase())
    .not("primary_type", "in", HIDDEN_TYPES_PG)
    .not("event_date", "is", null)
    .order("event_date", { ascending: true, nullsFirst: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return (data ?? []) as RaceWithNextEdition[];
}
