import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { AddToCalendar } from "@/components/race/AddToCalendar";
import { DistanceCard } from "@/components/race/DistanceCard";
import { RaceHero } from "@/components/race/RaceHero";
import { RegistrationCard } from "@/components/race/RegistrationCard";
import { RelatedRaces } from "@/components/race/RelatedRaces";
import { ShareButtons } from "@/components/race/ShareButtons";
import { Button } from "@/components/ui/button";
import { countryName } from "@/lib/format/country";
import { getDistancesForEdition, getRaceBySlug, getRelatedRaces } from "@/lib/queries/races";
import { raceEventJsonLd } from "@/lib/seo/jsonld";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const race = await getRaceBySlug(slug);
    if (!race) return { title: locale === "en" ? "Not found" : "찾을 수 없습니다" };
    const country = countryName(race.country_code, locale, race.country_name);
    return {
      title: `${race.canonical_name} — ${country}`,
      description:
        race.description?.slice(0, 160) ??
        (locale === "en"
          ? `${race.canonical_name} race info, schedule, registration.`
          : `${race.canonical_name} 대회 정보, 일정, 등록 안내.`),
      openGraph: {
        title: race.canonical_name,
        description: race.description?.slice(0, 200) ?? undefined,
        type: "article",
      },
    };
  } catch {
    return { title: slug };
  }
}

export default async function RaceDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("race_detail");

  let race: Awaited<ReturnType<typeof getRaceBySlug>> = null;
  try {
    race = await getRaceBySlug(slug);
  } catch (err) {
    console.error("[race-detail]", err);
  }
  if (!race) notFound();

  const [distances, related] = await Promise.all([
    race.edition_id ? getDistancesForEdition(race.edition_id).catch(() => []) : Promise.resolve([]),
    getRelatedRaces(race).catch(() => []),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://raceverse.app";
  const url = `${siteUrl.replace(/\/$/, "")}/races/${race.slug}`;
  const location = [race.city, race.country_name ?? race.country_code].filter(Boolean).join(", ");
  const jsonLd = raceEventJsonLd(race, siteUrl);

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: schema.org JSON-LD
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <RaceHero race={race} />

      <div className="container-wide grid gap-10 py-12 lg:grid-cols-[1fr_360px]">
        <article className="space-y-12">
          {distances.length > 0 && (
            <section>
              <h2 className="font-display text-2xl tracking-tight">{t("distances")}</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {distances.map((d) => (
                  <DistanceCard key={d.id} d={d} />
                ))}
              </div>
            </section>
          )}

          {(race.organizer_name || race.website_url) && (
            <section>
              <h2 className="font-display text-2xl tracking-tight">{t("organizer_section")}</h2>
              <div className="mt-4 space-y-2">
                {race.organizer_name && (
                  <p className="text-fg">
                    <span className="text-fg-subtle text-sm">{t("organizer")}</span>{" "}
                    <span className="font-medium">{race.organizer_name}</span>
                  </p>
                )}
                {race.website_url && (
                  <Button asChild variant="outline" size="sm">
                    <a href={race.website_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-3.5" /> {t("official_site")}
                    </a>
                  </Button>
                )}
              </div>
            </section>
          )}

          <section>
            <h2 className="font-display text-2xl tracking-tight">{t("share_section")}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <ShareButtons url={url} title={race.canonical_name} />
              {race.event_date && race.edition_id && (
                <AddToCalendar
                  raceName={race.canonical_name}
                  editionId={race.edition_id}
                  startDate={race.event_date}
                  endDate={race.event_end_date}
                  location={location}
                />
              )}
            </div>
          </section>

          <RelatedRaces races={related} />
        </article>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <RegistrationCard race={race} />
        </aside>
      </div>
    </>
  );
}
