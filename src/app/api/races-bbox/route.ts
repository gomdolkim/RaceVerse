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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const bbox = url.searchParams.get("bbox");
  if (!bbox) return NextResponse.json({ data: [] });
  const [west, south, east, north] = bbox.split(",").map(Number);
  if ([west, south, east, north].some(Number.isNaN)) {
    return NextResponse.json({ error: "invalid bbox" }, { status: 400 });
  }

  const supabase = await createSupabaseServer();

  // Slim direct view query (no RPC). Paginated so the world view returns
  // every geocoded race, not just the first 800. Slim SELECT keeps payload
  // small enough that ~5,500 rows × 9 fields stays under ~1 MB.
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
      .gte("latitude", south)
      .lte("latitude", north)
      .gte("longitude", west)
      .lte("longitude", east)
      .range(offset, offset + PAGE - 1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const batch = (data ?? []) as MapRow[];
    all.push(...batch);
    if (batch.length < PAGE) break;
    offset += PAGE;
  }

  return NextResponse.json(
    {
      data: all.map((r) => ({
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
