import "server-only";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { CountryStats, RaceWithNextEdition } from "@/lib/supabase/types";

export async function listCountries(): Promise<CountryStats[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("country_stats")
    .select("*")
    .order("race_count", { ascending: false });
  if (error) throw error;
  // country_stats may include rows with race_count=0 from inactive/uncategorized
  // races. Hide those — they're noise on the country grid.
  return ((data ?? []) as CountryStats[]).filter((c) => (c.race_count ?? 0) > 0);
}

export async function getCountry(code: string): Promise<CountryStats | null> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("country_stats")
    .select("*")
    .eq("country_code", code.toUpperCase())
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
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
    .neq("primary_type", "unknown")
    .order("event_date", { ascending: true, nullsFirst: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return (data ?? []) as RaceWithNextEdition[];
}
