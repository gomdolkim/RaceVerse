import { CountryFlag } from "@/components/race/CountryFlag";
import { countryNameKo } from "@/lib/format/country";
import { Link } from "@/lib/i18n/routing";
import type { CountryStats } from "@/lib/supabase/types";
import { formatNumber } from "@/lib/utils";

export function CountriesStrip({ countries }: { countries: CountryStats[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {countries.map((c) => (
        <li key={c.country_code}>
          <Link
            href={`/countries/${c.country_code}`}
            className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-raised p-4 transition-colors hover:border-accent/40 hover:bg-surface-overlay"
          >
            <div className="flex items-center gap-3 min-w-0">
              <CountryFlag code={c.country_code} size={26} />
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {countryNameKo(c.country_code, c.country_name)}
                </p>
                <p className="text-xs text-fg-subtle tabular">
                  {formatNumber(c.race_count)}개 대회
                </p>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
