import { InsightsCharts } from "@/components/charts/InsightsCharts";
import { CountUp } from "@/components/motion/CountUp";
import { listCountries } from "@/lib/queries/countries";
import { getDatasetCounts } from "@/lib/queries/races";
import {
  getDistanceDistribution,
  getMonthlyDistribution,
  getTypeDistribution,
} from "@/lib/queries/stats";
import { setRequestLocale } from "next-intl/server";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function InsightsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [counts, monthly, types, distances, countries] = await Promise.all([
    getDatasetCounts().catch(() => ({
      races: 0,
      geocoded: 0,
      countries: 0,
      withRegistration: 0,
    })),
    getMonthlyDistribution().catch(() => []),
    getTypeDistribution().catch(() => []),
    getDistanceDistribution().catch(() => []),
    listCountries().catch(() => []),
  ]);

  return (
    <div className="container-wide py-10 sm:py-14">
      <header className="mb-10 max-w-2xl">
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">데이터 인사이트</h1>
        <p className="mt-2 text-fg-muted">RaceVerse가 추적 중인 대회 데이터의 분포와 통계</p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-border bg-border mb-10">
        <Stat label="등록 대회" value={counts.races} />
        <Stat label="좌표 보유" value={counts.geocoded} />
        <Stat label="국가" value={counts.countries} />
        <Stat label="등록 가능" value={counts.withRegistration} />
      </div>

      <InsightsCharts
        monthly={monthly}
        types={types}
        distances={distances}
        topCountries={countries.slice(0, 12)}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface-raised p-5 sm:p-6">
      <p className="text-xs text-fg-subtle uppercase tracking-wider">{label}</p>
      <p className="mt-1 font-display text-2xl sm:text-3xl tabular">
        <CountUp value={value} />
      </p>
    </div>
  );
}
