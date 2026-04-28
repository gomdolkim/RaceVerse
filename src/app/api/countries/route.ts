import { listCountries } from "@/lib/queries/countries";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 1800; // 30min

/**
 * Lightweight country list endpoint — used by the first-visit InterestsModal.
 * Mirrors `listCountries()` so client components can lazy-fetch on demand
 * without the layout having to SSR the data on every page.
 */
export async function GET() {
  try {
    const countries = await listCountries();
    return NextResponse.json(
      { data: countries },
      { headers: { "cache-control": "public, max-age=1800, s-maxage=1800" } },
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "fetch failed", data: [] },
      { status: 500 },
    );
  }
}
