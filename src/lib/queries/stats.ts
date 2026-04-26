import "server-only";
import { createSupabaseServer } from "@/lib/supabase/server";

export interface MonthlyDistribution {
  month: string; // 'YYYY-MM'
  count: number;
}

export interface DistanceBucket {
  bucket: string;
  count: number;
}

export interface TypeDistribution {
  primary_type: string;
  count: number;
}

export async function getMonthlyDistribution(): Promise<MonthlyDistribution[]> {
  const supabase = await createSupabaseServer();
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("race_with_next_edition")
    .select("event_date")
    .neq("primary_type", "unknown")
    .gte("event_date", start)
    .order("event_date", { ascending: true })
    .limit(5000);
  if (error) throw error;
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    if (!row.event_date) continue;
    const month = row.event_date.slice(0, 7);
    counts.set(month, (counts.get(month) ?? 0) + 1);
  }
  return [...counts.entries()].map(([month, count]) => ({ month, count }));
}

export async function getTypeDistribution(): Promise<TypeDistribution[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("races_public")
    .select("primary_type")
    .eq("is_active", true)
    .neq("primary_type", "unknown")
    .limit(10000);
  if (error) throw error;
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    if (row.primary_type === "unknown") continue;
    counts.set(row.primary_type, (counts.get(row.primary_type) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([primary_type, count]) => ({ primary_type, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getDistanceDistribution(): Promise<DistanceBucket[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("race_distances")
    .select("distance_km")
    .not("distance_km", "is", null)
    .limit(10000);
  if (error) throw error;
  const buckets = new Map<string, number>([
    ["≤10K", 0],
    ["10–22K", 0],
    ["하프", 0],
    ["풀 마라톤", 0],
    ["50K", 0],
    ["80K+", 0],
    ["울트라 100K+", 0],
  ]);
  for (const row of data ?? []) {
    const km = row.distance_km;
    if (km === null) continue;
    let key = "≤10K";
    if (km > 100) key = "울트라 100K+";
    else if (km > 60) key = "80K+";
    else if (km > 42.5) key = "50K";
    else if (km >= 42 && km <= 42.5) key = "풀 마라톤";
    else if (km >= 21 && km < 22) key = "하프";
    else if (km >= 10) key = "10–22K";
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return [...buckets.entries()].map(([bucket, count]) => ({ bucket, count }));
}
