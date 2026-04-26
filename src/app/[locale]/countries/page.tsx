import { EmptyState } from "@/components/feedback/EmptyState";
import { CountryFlag } from "@/components/race/CountryFlag";
import { countryNameKo } from "@/lib/format/country";
import { Link } from "@/lib/i18n/routing";
import { listCountries } from "@/lib/queries/countries";
import { formatNumber } from "@/lib/utils";
import { Globe } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function CountriesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("countries");

  let countries: Awaited<ReturnType<typeof listCountries>> = [];
  let dbError: string | null = null;
  try {
    countries = await listCountries();
  } catch (err) {
    dbError = (err as Error).message;
  }

  return (
    <div className="container-wide py-10 sm:py-14">
      <header className="mb-10 max-w-2xl">
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-fg-muted tabular">
          {t("subtitle", { count: formatNumber(countries.length) })}
        </p>
      </header>

      {dbError && (
        <EmptyState
          icon={<Globe className="size-8" />}
          title="국가 목록을 불러올 수 없습니다"
          description={dbError}
        />
      )}

      {!dbError && countries.length === 0 && (
        <EmptyState
          icon={<Globe className="size-8" />}
          title="국가 데이터가 없습니다"
          description="DB 마이그레이션 적용 상태를 확인해주세요."
        />
      )}

      {countries.length > 0 && (
        <ul className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {countries.map((c) => (
            <li key={c.country_code}>
              <Link
                href={`/countries/${c.country_code}`}
                className="group flex h-full flex-col gap-3 rounded-xl border border-border bg-surface-raised p-5 transition-all hover:border-accent/40 hover:shadow-[0_8px_28px_-12px_oklch(var(--accent)/0.3)]"
              >
                <div className="flex items-center gap-3">
                  <CountryFlag code={c.country_code} size={32} />
                  <div className="min-w-0">
                    <p className="font-display text-lg tracking-tight truncate">
                      {countryNameKo(c.country_code, c.country_name)}
                    </p>
                    <p className="text-xs text-fg-subtle font-mono">{c.country_code}</p>
                  </div>
                </div>
                <dl className="grid grid-cols-3 gap-2 mt-auto pt-3 border-t border-border/60">
                  <div>
                    <dt className="text-[10px] text-fg-subtle uppercase tracking-wider">전체</dt>
                    <dd className="font-display text-lg tabular">{formatNumber(c.race_count)}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-fg-subtle uppercase tracking-wider">로드</dt>
                    <dd className="font-display text-lg tabular">
                      {formatNumber(c.marathon_count)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-fg-subtle uppercase tracking-wider">트레일</dt>
                    <dd className="font-display text-lg tabular">{formatNumber(c.trail_count)}</dd>
                  </div>
                </dl>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
