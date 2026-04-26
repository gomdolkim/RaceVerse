import { createSupabaseServer } from "@/lib/supabase/server";
import type { RaceWithNextEdition } from "@/lib/supabase/types";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lat = Number(url.searchParams.get("lat"));
  const lon = Number(url.searchParams.get("lon"));
  const radius = Number(url.searchParams.get("radius") ?? 50);
  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return NextResponse.json({ error: "lat and lon required" }, { status: 400 });
  }

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.rpc("races_near", {
    lat,
    lon,
    radius_km: radius,
    limit_count: 50,
  } as any);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = ((data ?? []) as RaceWithNextEdition[]).filter(
    (r) => r.primary_type !== "unknown" && r.event_date != null,
  );
  return NextResponse.json({ data: rows });
}
