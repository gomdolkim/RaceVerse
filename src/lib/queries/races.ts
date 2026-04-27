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

/** Types that should never surface in discovery surfaces (lists/charts/map). */
export const HIDDEN_PRIMARY_TYPES = ["unknown", "road_other"] as const;
const HIDDEN_TYPES_PG = `(${HIDDEN_PRIMARY_TYPES.join(",")})`;

/** Filter discovery-noise rows: hidden type or no scheduled date. */
function dropHidden<T extends { primary_type: string; event_date?: string | null }>(
  rows: T[],
): T[] {
  const hidden = new Set<string>(HIDDEN_PRIMARY_TYPES);
  return rows.filter((r) => !hidden.has(r.primary_type) && r.event_date != null);
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
    // Fetch limit+1 to detect "has more" without an extra count query —
    // PostgREST RPC doesn't expose a SELECT COUNT, so this gives correct
    // pagination behavior at the cost of one wasted row per page.
    const probe = limit + 1;
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
      limit_count: probe,
      offset_count: offset,
    } as any);
    if (error) throw error;
    const allRows = dropHidden((data ?? []) as RaceWithNextEdition[]);
    const hasMore = allRows.length > limit;
    const rows = allRows.slice(0, limit);
    // Approximate count: enough to keep pagination's "next" button correct.
    // Real total isn't available without a separate count query.
    const approxCount = offset + rows.length + (hasMore ? 1 : 0);
    return { data: rows, count: approxCount };
  }

  let q = supabase
    .from("race_with_next_edition")
    .select(RWE_SELECT, { count: "exact" })
    .not("primary_type", "in", HIDDEN_TYPES_PG)
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
    .not("primary_type", "in", HIDDEN_TYPES_PG)
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
  // If the parent race is one of the hidden types, skip related-race surface.
  if ((HIDDEN_PRIMARY_TYPES as readonly string[]).includes(race.primary_type)) return [];
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
    .not("primary_type", "in", HIDDEN_TYPES_PG)
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
    .not("primary_type", "in", HIDDEN_TYPES_PG)
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
    .not("primary_type", "in", HIDDEN_TYPES_PG)
    .gte("event_date", today)
    .order("event_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data?.event_date) return null;
  return (data.event_date as string).slice(0, 7);
}

/**
 * Fetch races by id list (for /saved page). Preserves caller's id ordering
 * so the user's "newest saved first" ordering survives the round-trip.
 */
export async function listRacesByIds(ids: string[]): Promise<RaceWithNextEdition[]> {
  if (!ids.length) return [];
  const supabase = await createSupabaseServer();
  // Chunk to stay safely under PostgREST's URL length limit on .in()
  const CHUNK = 200;
  const fetched: RaceWithNextEdition[] = [];
  for (let i = 0; i < ids.length; i += CHUNK) {
    const chunk = ids.slice(i, i + CHUNK);
    const { data, error } = await supabase
      .from("race_with_next_edition")
      .select(RWE_SELECT)
      .in("id", chunk);
    if (error) throw error;
    fetched.push(...((data ?? []) as RaceWithNextEdition[]));
  }
  // Re-order to match the input ids list. Drop any ids that no longer exist.
  const byId = new Map(fetched.map((r) => [r.id, r]));
  return ids.map((id) => byId.get(id)).filter((r): r is RaceWithNextEdition => r !== undefined);
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
      .not("primary_type", "in", HIDDEN_TYPES_PG),
    supabase
      .from("races_public")
      .select("id", { count: "exact", head: true })
      .not("primary_type", "in", HIDDEN_TYPES_PG)
      .not("latitude", "is", null),
    supabase.from("country_stats").select("country_code", { count: "exact", head: true }),
    supabase
      .from("race_with_next_edition")
      .select("id", { count: "exact", head: true })
      .not("primary_type", "in", HIDDEN_TYPES_PG)
      .not("registration_url", "is", null),
  ]);
  return {
    races: races.count ?? 0,
    geocoded: geocoded.count ?? 0,
    countries: countries.count ?? 0,
    withRegistration: registration.count ?? 0,
  };
}
