import { EmptyState } from "@/components/feedback/EmptyState";
import { HeroBackdrop } from "@/components/layout/HeroBackdrop";
import { RaceList } from "@/components/race/RaceList";
import { listRaces } from "@/lib/queries/races";
import { formatNumber } from "@/lib/utils";
import { Mountain } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const revalidate = 1800;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function TrailPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("trail");

  let races: Awaited<ReturnType<typeof listRaces>> = { data: [], count: 0 };
  try {
    races = await listRaces({ types: ["trail", "ultra"], limit: 48 });
  } catch {
    /* ignore */
  }

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border noise">
        <HeroBackdrop />
        <div className="container-wide relative z-10 py-14 sm:py-20">
          <Mountain className="size-12 text-accent" />
          <h1 className="mt-4 font-display text-4xl sm:text-5xl tracking-tight max-w-3xl">
            <span className="text-gradient-accent">{t("title_part_1")}</span>
            {t("title_part_2")}
          </h1>
          <p className="mt-3 max-w-2xl text-fg-muted">{t("subtitle")}</p>
        </div>
      </section>

      <div className="container-wide py-10 sm:py-14">
        <p className="mb-6 text-sm text-fg-muted tabular">
          {t("race_count", { count: formatNumber(races.count, locale) })}
        </p>
        {races.data.length === 0 ? (
          <EmptyState icon={<Mountain className="size-8" />} title={t("no_active")} />
        ) : (
          <RaceList races={races.data} />
        )}
      </div>
    </>
  );
}
