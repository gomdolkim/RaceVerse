import { createSupabaseServer } from "@/lib/supabase/server";
import type { RaceWithNextEdition } from "@/lib/supabase/types";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ data: [] });
  }
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.rpc("search_races", {
    search_query: q,
    limit_count: 12,
  } as any);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const rows = (data ?? []) as RaceWithNextEdition[];
  return NextResponse.json(
    {
      data: rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.canonical_name,
        country_code: r.country_code,
        country_name: r.country_name,
        city: r.city,
        event_date: r.event_date,
        primary_type: r.primary_type,
      })),
    },
    {
      headers: { "cache-control": "public, max-age=120, s-maxage=120" },
    },
  );
}
