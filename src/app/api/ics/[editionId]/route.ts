import { buildIcs } from "@/lib/ics/builder";
import { createSupabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ editionId: string }> }) {
  const { editionId } = await ctx.params;
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("race_with_next_edition")
    .select("*")
    .eq("edition_id", editionId)
    .maybeSingle();
  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!data.event_date) {
    return NextResponse.json({ error: "Race has no scheduled date" }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://raceverse.app";
  const ics = buildIcs(data, siteUrl);
  return new NextResponse(ics, {
    status: 200,
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": `attachment; filename="${data.slug}.ics"`,
      "cache-control": "public, max-age=3600",
    },
  });
}
