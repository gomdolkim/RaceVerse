import { InsightsCharts } from "@/components/charts/InsightsCharts";
import { CountUp } from "@/components/motion/CountUp";
import { getDatasetCounts } from "@/lib/queries/races";
import {
  getDistanceDistribution,
  getMonthlyDistribution,
  getTopCountries,
  getTypeDistribution,
} from "@/lib/queries/stats";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function InsightsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("insights");

  const [counts, monthly, types, distances, topCountries] = await Promise.all([
    getDatasetCounts().catch(() => ({
      races: 0,
      geocoded: 0,
      countries: 0,
      withRegistration: 0,
    })),
    getMonthlyDistribution().catch(() => []),
    getTypeDistribution().catch(() => []),
    getDistanceDistribution().catch(() => []),
    getTopCountries(12).catch(() => []),
  ]);

  return (
    <div className="container-wide py-10 sm:py-14">
      <header className="mb-10 max-w-2xl">
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-fg-muted">{t("subtitle")}</p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-border bg-border mb-10">
        <Stat label={t("stat_races")} value={counts.races} />
        <Stat label={t("stat_geocoded")} value={counts.geocoded} />
        <Stat label={t("stat_countries")} value={counts.countries} />
        <Stat label={t("stat_with_registration")} value={counts.withRegistration} />
      </div>

      <InsightsCharts
        monthly={monthly}
        types={types}
        distances={distances}
        topCountries={topCountries}
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
