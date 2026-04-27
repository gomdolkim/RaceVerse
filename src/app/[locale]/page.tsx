import { CountriesStrip } from "@/components/home/CountriesStrip";
import { Hero } from "@/components/home/Hero";
import { InterestsSection } from "@/components/home/InterestsSection";
import { SectionHeader } from "@/components/home/SectionHeader";
import { StatsRow } from "@/components/home/StatsRow";
import { RaceList } from "@/components/race/RaceList";
import { INTERESTS_COOKIE, parseInterests } from "@/lib/prefs/interests";
import { listCountries } from "@/lib/queries/countries";
import {
  getDatasetCounts,
  getRecentlyAdded,
  getTrailRaces,
  getUpcomingMajors,
  listRaces,
} from "@/lib/queries/races";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { cookies } from "next/headers";

export const revalidate = 1800; // 30min

interface PageProps {
  params: Promise<{ locale: string }>;
}

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch (err) {
    console.warn("[home] query failed:", (err as Error).message);
    return fallback;
  }
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  const cookieStore = await cookies();
  const interests = parseInterests(cookieStore.get(INTERESTS_COOKIE)?.value);
  const today = new Date().toISOString().slice(0, 10);

  const [counts, upcoming, recent, trail, countries, interestsResult] = await Promise.all([
    safe(getDatasetCounts(), {
      races: 5547,
      geocoded: 4185,
      countries: 178,
      withRegistration: 1080,
    }),
    safe(getUpcomingMajors(8), [] as Awaited<ReturnType<typeof getUpcomingMajors>>),
    safe(getRecentlyAdded(8), [] as Awaited<ReturnType<typeof getRecentlyAdded>>),
    safe(getTrailRaces(8), [] as Awaited<ReturnType<typeof getTrailRaces>>),
    safe(listCountries(), [] as Awaited<ReturnType<typeof listCountries>>),
    interests && interests.length > 0
      ? safe(listRaces({ countries: interests, dateFrom: today, limit: 12 }), {
          data: [],
          count: 0,
        } as Awaited<ReturnType<typeof listRaces>>)
      : Promise.resolve({ data: [], count: 0 } as Awaited<ReturnType<typeof listRaces>>),
  ]);

  const topCountries = countries.slice(0, 12);

  return (
    <>
      <Hero raceCount={counts.races} locationCount={counts.geocoded} />

      <section className="container-wide -mt-10 sm:-mt-14 relative z-20">
        <StatsRow
          races={counts.races}
          geocoded={counts.geocoded}
          countries={counts.countries}
          withRegistration={counts.withRegistration}
        />
      </section>

      <InterestsSection
        initialInterests={interests}
        availableCountries={countries}
        races={interestsResult.data}
      />

      <section className="container-wide mt-16 sm:mt-24">
        <SectionHeader
          title={t("featured_upcoming")}
          subtitle={t("featured_upcoming_sub")}
          href="/races"
          ctaLabel={t("see_all")}
        />
        {upcoming.length > 0 ? (
          <RaceList races={upcoming} />
        ) : (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-fg-muted">
            {t("no_data_yet", { var: "NEXT_PUBLIC_SUPABASE_ANON_KEY" })}
          </p>
        )}
      </section>

      {trail.length > 0 && (
        <section className="container-wide mt-16 sm:mt-24">
          <SectionHeader
            title={t("featured_trail")}
            subtitle={t("featured_trail_sub")}
            href="/trail"
            ctaLabel={t("see_all")}
          />
          <RaceList races={trail} />
        </section>
      )}

      {recent.length > 0 && (
        <section className="container-wide mt-16 sm:mt-24">
          <SectionHeader
            title={t("featured_recent")}
            subtitle={t("featured_recent_sub")}
            href="/races"
            ctaLabel={t("see_all")}
          />
          <RaceList races={recent} />
        </section>
      )}

      {topCountries.length > 0 && (
        <section className="container-wide mt-16 sm:mt-24">
          <SectionHeader
            title={t("featured_countries")}
            subtitle={t("featured_countries_sub")}
            href="/countries"
            ctaLabel={t("see_all")}
          />
          <CountriesStrip countries={topCountries} />
        </section>
      )}
    </>
  );
}
