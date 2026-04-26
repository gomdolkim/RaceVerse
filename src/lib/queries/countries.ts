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
  return data ?? [];
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
    .order("event_date", { ascending: true, nullsFirst: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return (data ?? []) as RaceWithNextEdition[];
}
