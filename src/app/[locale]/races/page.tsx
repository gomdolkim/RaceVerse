import { EmptyState } from "@/components/feedback/EmptyState";
import { FilterBar } from "@/components/filter/FilterBar";
import { Pagination } from "@/components/filter/Pagination";
import { RaceList } from "@/components/race/RaceList";
import { listRaces } from "@/lib/queries/races";
import { parseFilters } from "@/lib/url-state/filters";
import { formatNumber } from "@/lib/utils";
import { Search } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const revalidate = 600;

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RacesPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const t = await getTranslations("races");

  let data: Awaited<ReturnType<typeof listRaces>> = { data: [], count: 0 };
  let dbError: string | null = null;
  try {
    data = await listRaces(filters);
  } catch (err) {
    dbError = (err as Error).message;
  }

  const limit = filters.limit ?? 24;
  const offset = filters.offset ?? 0;

  return (
    <div className="container-wide py-10 sm:py-14">
      <header className="mb-8 max-w-2xl">
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-fg-muted">{t("subtitle")}</p>
      </header>

      <FilterBar />

      <div className="mt-8">
        <p className="mb-5 text-sm text-fg-muted tabular">
          {t("results_count", { count: formatNumber(data.count) })}
        </p>

        {dbError && (
          <EmptyState
            icon={<Search className="size-8" />}
            title="데이터에 연결할 수 없습니다"
            description={`Supabase 환경 변수와 마이그레이션 적용 상태를 확인해주세요. (${dbError})`}
          />
        )}

        {!dbError && data.data.length === 0 && (
          <EmptyState
            icon={<Search className="size-8" />}
            title={t("no_results")}
            description={t("no_results_hint")}
          />
        )}

        {data.data.length > 0 && (
          <>
            <RaceList races={data.data} />
            <Pagination offset={offset} limit={limit} total={data.count} />
          </>
        )}
      </div>
    </div>
  );
}
