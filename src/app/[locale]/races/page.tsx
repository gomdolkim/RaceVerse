import { EmptyState } from "@/components/feedback/EmptyState";
import { FilterBar } from "@/components/filter/FilterBar";
import { Pagination } from "@/components/filter/Pagination";
import { RaceList } from "@/components/race/RaceList";
import { redirect } from "@/lib/i18n/routing";
import { FILTER_COOKIE, hasMeaningfulPrefs, parsePrefs } from "@/lib/prefs/filter-prefs";
import { listCountries } from "@/lib/queries/countries";
import { listRaces } from "@/lib/queries/races";
import { isEmpty, parseFilters, serializeFilters } from "@/lib/url-state/filters";
import { formatNumber } from "@/lib/utils";
import { Search } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { cookies } from "next/headers";

export const revalidate = 600;

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RacesPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const urlFilters = parseFilters(sp);
  const t = await getTranslations("races");

  // When the URL has no filters AND the user has saved prefs (e.g., from
  // home interests), redirect to a URL that *carries* those filters. This
  // keeps the URL the single source of truth for the client FilterBar so
  // its state never disagrees with what the server fetched. Without this,
  // FilterBar would mount with empty URL state and overwrite the cookie.
  if (isEmpty(urlFilters)) {
    const cookieStore = await cookies();
    const saved = parsePrefs(cookieStore.get(FILTER_COOKIE)?.value);
    if (saved && hasMeaningfulPrefs(saved)) {
      const params = serializeFilters({
        countries: saved.countries,
        types: saved.types,
        onlyWithRegistration: saved.onlyWithRegistration,
        dateFrom: saved.dateFrom,
        dateTo: saved.dateTo,
      });
      const qs = params.toString();
      // Use next-intl's locale-aware redirect so /en/races is preserved
      // (avoids redirect loop where /races would re-trigger middleware).
      if (qs) redirect({ href: `/races?${qs}`, locale });
    }
  }

  const filters = urlFilters;

  let data: Awaited<ReturnType<typeof listRaces>> = { data: [], count: 0 };
  let countries: Awaited<ReturnType<typeof listCountries>> = [];
  let dbError: string | null = null;
  try {
    [data, countries] = await Promise.all([listRaces(filters), listCountries()]);
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

      <FilterBar availableCountries={countries} />

      <div className="mt-8">
        <p className="mb-5 text-sm text-fg-muted tabular">
          {t("results_count", { count: formatNumber(data.count, locale) })}
        </p>

        {dbError && (
          <EmptyState
            icon={<Search className="size-8" />}
            title={t("db_error")}
            description={`${t("db_error_hint")} (${dbError})`}
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
