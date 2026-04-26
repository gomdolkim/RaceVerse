import { createSupabaseServer } from "@/lib/supabase/server";
import type { RaceWithNextEdition } from "@/lib/supabase/types";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const bbox = url.searchParams.get("bbox");
  if (!bbox) return NextResponse.json({ data: [] });
  const [west, south, east, north] = bbox.split(",").map(Number);
  if ([west, south, east, north].some(Number.isNaN)) {
    return NextResponse.json({ error: "invalid bbox" }, { status: 400 });
  }

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.rpc("races_in_bbox", {
    west,
    south,
    east,
    north,
    limit_count: 800,
  } as any);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []) as RaceWithNextEdition[];
  return NextResponse.json(
    {
      data: rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.canonical_name,
        country_code: r.country_code,
        city: r.city,
        latitude: r.latitude,
        longitude: r.longitude,
        primary_type: r.primary_type,
        event_date: r.event_date,
      })),
    },
    {
      headers: { "cache-control": "public, max-age=120, s-maxage=120" },
    },
  );
}
