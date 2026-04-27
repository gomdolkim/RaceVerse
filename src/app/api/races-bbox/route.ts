import { createSupabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const HIDDEN_TYPES_PG = "(unknown,road_other)";
const PAGE = 1000;
const HARD_CAP = 8000;

interface MapRow {
  id: string;
  slug: string;
  canonical_name: string;
  country_code: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  primary_type: string;
  event_date: string | null;
}

interface BBox {
  west: number;
  south: number;
  east: number;
  north: number;
}

async function fetchBbox(
  supabase: Awaited<ReturnType<typeof createSupabaseServer>>,
  bbox: BBox,
): Promise<MapRow[]> {
  const all: MapRow[] = [];
  let offset = 0;
  while (offset < HARD_CAP) {
    const { data, error } = await supabase
      .from("race_with_next_edition")
      .select(
        "id, slug, canonical_name, country_code, city, latitude, longitude, primary_type, event_date",
      )
      .not("primary_type", "in", HIDDEN_TYPES_PG)
      .not("event_date", "is", null)
      .not("latitude", "is", null)
      .not("longitude", "is", null)
      .gte("latitude", bbox.south)
      .lte("latitude", bbox.north)
      .gte("longitude", bbox.west)
      .lte("longitude", bbox.east)
      .range(offset, offset + PAGE - 1);
    if (error) throw new Error(error.message);
    const batch = (data ?? []) as MapRow[];
    all.push(...batch);
    if (batch.length < PAGE) break;
    offset += PAGE;
  }
  return all;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const bbox = url.searchParams.get("bbox");
  if (!bbox) return NextResponse.json({ data: [] });
  const [west, south, east, north] = bbox.split(",").map(Number);
  if ([west, south, east, north].some(Number.isNaN)) {
    return NextResponse.json({ error: "invalid bbox" }, { status: 400 });
  }

  const supabase = await createSupabaseServer();

  // Antimeridian crossing: when the map is panned across the 180°/-180°
  // boundary, MapLibre reports west > east. We split into two queries
  // (eastern hemisphere up to +180, western hemisphere from -180) and
  // merge — otherwise PostgREST returns zero rows because the lat/lon
  // BETWEEN check is empty.
  let rows: MapRow[];
  try {
    if (west > east) {
      const [eastSide, westSide] = await Promise.all([
        fetchBbox(supabase, { west, east: 180, south, north }),
        fetchBbox(supabase, { west: -180, east, south, north }),
      ]);
      rows = [...eastSide, ...westSide];
    } else {
      rows = await fetchBbox(supabase, { west, east, south, north });
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "fetch failed" },
      { status: 500 },
    );
  }

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
    { headers: { "cache-control": "public, max-age=120, s-maxage=120" } },
  );
}
