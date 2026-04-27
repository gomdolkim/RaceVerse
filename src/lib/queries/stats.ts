import "server-only";
import { createSupabaseServer } from "@/lib/supabase/server";
import { listCountries } from "./countries";

export interface MonthlyDistribution {
  /** 'YYYY-MM' */
  month: string;
  count: number;
}

export interface DistanceBucket {
  /** Translation key in `insights.bucket_*` */
  bucketKey: string;
  /** Display order (low → high) */
  order: number;
  count: number;
}

export interface TypeDistribution {
  primary_type: string;
  count: number;
}

export interface CountryAgg {
  country_code: string;
  country_name: string | null;
  race_count: number;
  marathon_count: number;
  trail_count: number;
  geocoded_count: number;
}

const HIDDEN_TYPES_PG = "(unknown,road_other)";
const HIDDEN_SET = new Set(["unknown", "road_other"]);
const PAGE = 1000;
const HARD_CAP = 20000;

/**
 * Distribution of next-upcoming-edition event_date by month, across the
 * ENTIRE dataset (no artificial date or limit cap). Paginated to bypass
 * PostgREST's per-response cap.
 */
export async function getMonthlyDistribution(): Promise<MonthlyDistribution[]> {
  const supabase = await createSupabaseServer();
  const counts = new Map<string, number>();
  let offset = 0;
  while (offset < HARD_CAP) {
    const { data, error } = await supabase
      .from("race_with_next_edition")
      .select("event_date")
      .not("primary_type", "in", HIDDEN_TYPES_PG)
      .not("event_date", "is", null)
      .order("event_date", { ascending: true })
      .range(offset, offset + PAGE - 1);
    if (error) throw error;
    const batch = data ?? [];
    for (const row of batch) {
      const ed = row.event_date as string | null;
      if (!ed) continue;
      const month = ed.slice(0, 7);
      counts.set(month, (counts.get(month) ?? 0) + 1);
    }
    if (batch.length < PAGE) break;
    offset += PAGE;
  }
  return [...counts.entries()]
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Type distribution across all active races (excluding hidden types).
 * Paginated to avoid PostgREST cap.
 */
export async function getTypeDistribution(): Promise<TypeDistribution[]> {
  const supabase = await createSupabaseServer();
  const counts = new Map<string, number>();
  let offset = 0;
  while (offset < HARD_CAP) {
    const { data, error } = await supabase
      .from("races_public")
      .select("primary_type")
      .eq("is_active", true)
      .not("primary_type", "in", HIDDEN_TYPES_PG)
      .range(offset, offset + PAGE - 1);
    if (error) throw error;
    const batch = data ?? [];
    for (const row of batch) {
      const pt = row.primary_type as string;
      if (HIDDEN_SET.has(pt)) continue;
      counts.set(pt, (counts.get(pt) ?? 0) + 1);
    }
    if (batch.length < PAGE) break;
    offset += PAGE;
  }
  return [...counts.entries()]
    .map(([primary_type, count]) => ({ primary_type, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Distance distribution across all race_distances rows (excluding distances
 * that belong to hidden-type parent races).
 *
 * Buckets are clean, mutually exclusive, sorted ascending — and labeled via
 * i18n keys so the chart renders properly in both KO and EN.
 */
const DISTANCE_BUCKETS: { key: string; min: number; max: number; order: number }[] = [
  { key: "bucket_under_10k", min: 0, max: 10, order: 0 },
  { key: "bucket_10_25k", min: 10, max: 25, order: 1 },
  { key: "bucket_25_50k", min: 25, max: 50, order: 2 },
  { key: "bucket_50_100k", min: 50, max: 100, order: 3 },
  { key: "bucket_100k_plus", min: 100, max: Number.POSITIVE_INFINITY, order: 4 },
];

export async function getDistanceDistribution(): Promise<DistanceBucket[]> {
  const supabase = await createSupabaseServer();

  // Step 1: collect IDs of editions whose parent race is visible.
  const visibleEditionIds = new Set<string>();
  let offset = 0;
  while (offset < HARD_CAP) {
    const { data, error } = await supabase
      .from("race_with_next_edition")
      .select("edition_id")
      .not("primary_type", "in", HIDDEN_TYPES_PG)
      .not("event_date", "is", null)
      .range(offset, offset + PAGE - 1);
    if (error) throw error;
    const batch = data ?? [];
    for (const row of batch) {
      const eid = row.edition_id as string | null;
      if (eid) visibleEditionIds.add(eid);
    }
    if (batch.length < PAGE) break;
    offset += PAGE;
  }

  // Step 2: page through race_distances, count only those from visible editions.
  const counts = new Map<string, number>();
  for (const b of DISTANCE_BUCKETS) counts.set(b.key, 0);
  offset = 0;
  while (offset < HARD_CAP) {
    const { data, error } = await supabase
      .from("race_distances")
      .select("distance_km, race_edition_id")
      .not("distance_km", "is", null)
      .range(offset, offset + PAGE - 1);
    if (error) throw error;
    const batch = data ?? [];
    for (const row of batch) {
      const km = row.distance_km as number | null;
      const eid = row.race_edition_id as string | null;
      if (km == null || km < 0) continue;
      // Only count distances from visible races. (If the join is empty
      // because of cross-table state, fall through to count anyway.)
      if (eid && !visibleEditionIds.has(eid)) continue;
      const bucket = DISTANCE_BUCKETS.find((b) => km >= b.min && km < b.max);
      if (bucket) counts.set(bucket.key, (counts.get(bucket.key) ?? 0) + 1);
    }
    if (batch.length < PAGE) break;
    offset += PAGE;
  }

  return DISTANCE_BUCKETS.map((b) => ({
    bucketKey: b.key,
    order: b.order,
    count: counts.get(b.key) ?? 0,
  }));
}

/**
 * Top countries — delegates to `listCountries` so /insights, /countries,
 * /races filters, /calendar filters, and the home strip ALL agree.
 */
export async function getTopCountries(limit = 12): Promise<CountryAgg[]> {
  const all = await listCountries();
  return all.slice(0, limit);
}
