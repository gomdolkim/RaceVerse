import { EmptyState } from "@/components/feedback/EmptyState";
import { HeroBackdrop } from "@/components/layout/HeroBackdrop";
import { CountryFlag } from "@/components/race/CountryFlag";
import { RaceList } from "@/components/race/RaceList";
import { countryNameKo } from "@/lib/format/country";
import { getCountry, getRacesByCountry } from "@/lib/queries/countries";
import { formatNumber } from "@/lib/utils";
import { Search } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ locale: string; code: string }>;
}

export default async function CountryDetailPage({ params }: PageProps) {
  const { locale, code } = await params;
  setRequestLocale(locale);

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
                {countryNameKo(country.country_code, country.country_name)}
              </h1>
            </div>
          </div>
          <dl className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-border bg-border max-w-2xl">
            <Stat label="전체 대회" value={country.race_count} />
            <Stat label="로드" value={country.marathon_count} />
            <Stat label="트레일" value={country.trail_count} />
            <Stat label="좌표 보유" value={country.geocoded_count} />
          </dl>
        </div>
      </section>

      <div className="container-wide py-10 sm:py-14">
        <h2 className="font-display text-2xl tracking-tight mb-6">대회 목록</h2>
        {races.length === 0 ? (
          <EmptyState icon={<Search className="size-8" />} title="이 국가의 활성 대회가 없습니다" />
        ) : (
          <RaceList races={races} />
        )}
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface-raised p-5">
      <dt className="text-xs text-fg-subtle uppercase tracking-wider">{label}</dt>
      <dd className="font-display text-2xl tabular mt-1">{formatNumber(value)}</dd>
    </div>
  );
}
