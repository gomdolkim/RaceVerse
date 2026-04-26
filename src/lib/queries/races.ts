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

/** Filter discovery-noise rows: uncategorized type or no scheduled date. */
function dropHidden<T extends { primary_type: string; event_date?: string | null }>(
  rows: T[],
): T[] {
  return rows.filter((r) => r.primary_type !== "unknown" && r.event_date != null);
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
    const rows = dropHidden((data ?? []) as RaceWithNextEdition[]);
    return { data: rows, count: rows.length };
  }

  let q = supabase
    .from("race_with_next_edition")
    .select(RWE_SELECT, { count: "exact" })
    .neq("primary_type", "unknown")
    .not("event_date", "is", null)
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
    .not("event_date", "is", null)
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

const CALENDAR_SELECT =
  "id, slug, canonical_name, country_code, country_name, city, event_date, primary_type, registration_url";

/**
 * Fetch races for a single calendar month — `YYYY-MM`.
 * One month is well under PostgREST limits, so a single call suffices.
 */
export async function listRacesForMonth(month: string): Promise<RaceWithNextEdition[]> {
  const m = /^(\d{4})-(\d{2})$/.exec(month);
  if (!m) return [];
  const year = Number(m[1]);
  const monthIdx = Number(m[2]) - 1;
  const start = `${month}-01`;
  const lastDay = new Date(year, monthIdx + 1, 0).getDate();
  const end = `${month}-${String(lastDay).padStart(2, "0")}`;

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("race_with_next_edition")
    .select(CALENDAR_SELECT)
    .neq("primary_type", "unknown")
    .gte("event_date", start)
    .lte("event_date", end)
    .order("event_date", { ascending: true })
    .limit(2000);
  if (error) throw error;
  return (data ?? []) as RaceWithNextEdition[];
}

/**
 * Find the YYYY-MM of the earliest upcoming race ≥ today.
 * Used to redirect the user when they land on /calendar without a month
 * param, so they immediately see a month with content.
 */
export async function getEarliestUpcomingMonth(): Promise<string | null> {
  const supabase = await createSupabaseServer();
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("race_with_next_edition")
    .select("event_date")
    .neq("primary_type", "unknown")
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error || !data?.event_date) return null;
  return (data.event_date as string).slice(0, 7);
}

/**
 * Find the YYYY-MM of the latest scheduled race we know about.
 * Used to disable the "next month" button at the boundary.
 */
export async function getLatestUpcomingMonth(): Promise<string | null> {
  const supabase = await createSupabaseServer();
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("race_with_next_edition")
    .select("event_date")
    .neq("primary_type", "unknown")
    .gte("event_date", today)
    .order("event_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data?.event_date) return null;
  return (data.event_date as string).slice(0, 7);
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
