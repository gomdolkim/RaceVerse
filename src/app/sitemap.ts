import { createSupabaseServer } from "@/lib/supabase/server";
import type { MetadataRoute } from "next";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://raceverse.app").replace(/\/$/, "");
  const staticRoutes = [
    "",
    "/races",
    "/calendar",
    "/map",
    "/countries",
    "/trail",
    "/insights",
    "/about",
  ];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((p) => ({
    url: `${base}${p}`,
    changeFrequency: "daily",
    priority: p === "" ? 1.0 : 0.8,
  }));

  try {
    const supabase = await createSupabaseServer();
    const { data } = await supabase
      .from("races_public")
      .select("slug, updated_at")
      .eq("is_active", true)
      .limit(5000);
    for (const row of (data ?? []) as { slug: string; updated_at: string | null }[]) {
      entries.push({
        url: `${base}/races/${row.slug}`,
        lastModified: row.updated_at ? new Date(row.updated_at) : undefined,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } catch {
    /* env missing — return static-only */
  }

  return entries;
}
