import "server-only";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { RaceDistance, RacePublic, RaceWithNextEdition } from "@/lib/supabase/types";

export interface RaceFilters {
  countries?: string[];
  types?: string[];
  distanceMin?: number;
  distanceMax?: number;
  dateFrom?: string;
  dateTo?: string;
  q?: string;
  onlyWithRegistration?: boolean;
  limit?: number;
  offset?: number;
}

const RWE_SELECT = "*";

/** Filter "unknown" primary_type races out of any list — they pollute discovery. */
function dropUnknown<T extends { primary_type: string }>(rows: T[]): T[] {
  return rows.filter((r) => r.primary_type !== "unknown");
}

export async function listRaces(filters: RaceFilters = {}): Promise<{
  data: RaceWithNextEdition[];
  count: number;
}> {
  const supabase = await createSupabaseServer();
  const limit = filters.limit ?? 24;
  const offset = filters.offset ?? 0;

  // Use search_races RPC for combined filtering when distance filter is applied,
  // or when full-text search is needed. Otherwise direct view query is faster.
  if (filters.distanceMin !== undefined || filters.distanceMax !== undefined || filters.q) {
    // biome-ignore lint/suspicious/noExplicitAny: untyped RPC, see lib/supabase/types
    const { data, error } = await supabase.rpc("search_races", {
      countries: filters.countries ?? null,
      types: filters.types ?? null,
      distance_min: filters.distanceMin ?? null,
      distance_max: filters.distanceMax ?? null,
      date_from: filters.dateFrom ?? null,
      date_to: filters.dateTo ?? null,
      search_query: filters.q ?? null,
      only_with_registration: filters.onlyWithRegistration ?? false,
      limit_count: limit,
      offset_count: offset,
    } as any);
    if (error) throw error;
    const rows = dropUnknown((data ?? []) as RaceWithNextEdition[]);
    return { data: rows, count: rows.length };
  }

  let q = supabase
    .from("race_with_next_edition")
    .select(RWE_SELECT, { count: "exact" })
    .neq("primary_type", "unknown")
    .order("event_date", { ascending: true, nullsFirst: false })
    .range(offset, offset + limit - 1);

  if (filters.countries?.length) q = q.in("country_code", filters.countries);
  if (filters.types?.length) q = q.in("primary_type", filters.types);
  if (filters.dateFrom) q = q.gte("event_date", filters.dateFrom);
  if (filters.dateTo) q = q.lte("event_date", filters.dateTo);
  if (filters.onlyWithRegistration) q = q.not("registration_url", "is", null);

  const { data, error, count } = await q;
  if (error) throw error;
  return { data: (data ?? []) as RaceWithNextEdition[], count: count ?? 0 };
}

export async function getRaceBySlug(slug: string): Promise<RaceWithNextEdition | null> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("race_with_next_edition")
    .select(RWE_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return data as RaceWithNextEdition;
}

export async function getDistancesForEdition(editionId: string): Promise<RaceDistance[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("race_distances")
    .select("*")
    .eq("race_edition_id", editionId)
    .order("distance_km", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as RaceDistance[];
}

export async function getUpcomingMajors(limit = 8): Promise<RaceWithNextEdition[]> {
  const supabase = await createSupabaseServer();
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("race_with_next_edition")
    .select(RWE_SELECT)
    .eq("primary_type", "road_marathon")
    .gte("event_date", today)
    .not("registration_url", "is", null)
    .order("event_date", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as RaceWithNextEdition[];
}

export async function getRecentlyAdded(limit = 8): Promise<RaceWithNextEdition[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("race_with_next_edition")
    .select(RWE_SELECT)
    .neq("primary_type", "unknown")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as RaceWithNextEdition[];
}

export async function getTrailRaces(limit = 8): Promise<RaceWithNextEdition[]> {
  const supabase = await createSupabaseServer();
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("race_with_next_edition")
    .select(RWE_SELECT)
    .in("primary_type", ["trail", "ultra"])
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as RaceWithNextEdition[];
}

export async function getRelatedRaces(race: RacePublic, limit = 6): Promise<RaceWithNextEdition[]> {
  const supabase = await createSupabaseServer();
  const today = new Date().toISOString().slice(0, 10);
  // If the parent race itself is uncategorized, skip related-race recommendations.
  if (race.primary_type === "unknown") return [];
  const { data, error } = await supabase
    .from("race_with_next_edition")
    .select(RWE_SELECT)
    .eq("primary_type", race.primary_type)
    .neq("id", race.id)
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as RaceWithNextEdition[];
}

export async function getDatasetCounts(): Promise<{
  races: number;
  geocoded: number;
  countries: number;
  withRegistration: number;
}> {
  const supabase = await createSupabaseServer();
  const [races, geocoded, countries, registration] = await Promise.all([
    supabase
      .from("races_public")
      .select("id", { count: "exact", head: true })
      .neq("primary_type", "unknown"),
    supabase
      .from("races_public")
      .select("id", { count: "exact", head: true })
      .neq("primary_type", "unknown")
      .not("latitude", "is", null),
    supabase.from("country_stats").select("country_code", { count: "exact", head: true }),
    supabase
      .from("race_with_next_edition")
      .select("id", { count: "exact", head: true })
      .neq("primary_type", "unknown")
      .not("registration_url", "is", null),
  ]);
  return {
    races: races.count ?? 0,
    geocoded: geocoded.count ?? 0,
    countries: countries.count ?? 0,
    withRegistration: registration.count ?? 0,
  };
}
