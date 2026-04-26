import { EmptyState } from "@/components/feedback/EmptyState";
import { HeroBackdrop } from "@/components/layout/HeroBackdrop";
import { CountryFlag } from "@/components/race/CountryFlag";
import { RaceList } from "@/components/race/RaceList";
import { countryName } from "@/lib/format/country";
import { getCountry, getRacesByCountry } from "@/lib/queries/countries";
import { formatNumber } from "@/lib/utils";
import { Search } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ locale: string; code: string }>;
}

export default async function CountryDetailPage({ params }: PageProps) {
  const { locale, code } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("countries");
  const tRaces = await getTranslations("races");

  let country: Awaited<ReturnType<typeof getCountry>> = null;
  let races: Awaited<ReturnType<typeof getRacesByCountry>> = [];
  try {
    country = await getCountry(code);
    races = await getRacesByCountry(code, 60);
  } catch {
    /* fall through to 404 */
  }
  if (!country) notFound();

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border noise">
        <HeroBackdrop />
        <div className="container-wide relative z-10 py-12 sm:py-16">
          <div className="flex items-center gap-5">
            <CountryFlag code={country.country_code} size={64} />
            <div>
              <p className="font-mono text-xs text-fg-subtle">{country.country_code}</p>
              <h1 className="font-display text-4xl sm:text-5xl tracking-tight">
                {countryName(country.country_code, locale, country.country_name)}
              </h1>
            </div>
          </div>
          <dl className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-border bg-border max-w-2xl">
            <Stat label={t("stat_total")} value={country.race_count} locale={locale} />
            <Stat label={t("stat_road")} value={country.marathon_count} locale={locale} />
            <Stat label={t("stat_trail")} value={country.trail_count} locale={locale} />
            <Stat label={t("stat_geocoded")} value={country.geocoded_count} locale={locale} />
          </dl>
        </div>
      </section>

      <div className="container-wide py-10 sm:py-14">
        <h2 className="font-display text-2xl tracking-tight mb-6">{t("race_list")}</h2>
        {races.length === 0 ? (
          <EmptyState icon={<Search className="size-8" />} title={tRaces("no_active")} />
        ) : (
          <RaceList races={races} />
        )}
      </div>
    </>
  );
}

function Stat({ label, value, locale }: { label: string; value: number; locale: string }) {
  return (
    <div className="bg-surface-raised p-5">
      <dt className="text-xs text-fg-subtle uppercase tracking-wider">{label}</dt>
      <dd className="font-display text-2xl tabular mt-1">{formatNumber(value, locale)}</dd>
    </div>
  );
}
