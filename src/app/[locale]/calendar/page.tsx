import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { EmptyState } from "@/components/feedback/EmptyState";
import { FILTER_COOKIE, parsePrefs } from "@/lib/prefs/filter-prefs";
import { listCountries } from "@/lib/queries/countries";
import {
  getEarliestUpcomingMonth,
  getLatestUpcomingMonth,
  listRacesForMonth,
} from "@/lib/queries/races";
import { Calendar as CalendarIcon } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { cookies } from "next/headers";

export const revalidate = 1800;

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const MONTH_RE = /^\d{4}-\d{2}$/;

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function CalendarPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("calendar");

  const sp = await searchParams;
  const requested = typeof sp.month === "string" ? sp.month : undefined;
  const month = requested && MONTH_RE.test(requested) ? requested : currentMonth();

  const cookieStore = await cookies();
  const saved = parsePrefs(cookieStore.get(FILTER_COOKIE)?.value);
  const initialCountries = saved?.countries ?? [];

  // Fetch the requested month + horizon probes in parallel.
  let races: Awaited<ReturnType<typeof listRacesForMonth>> = [];
  let countries: Awaited<ReturnType<typeof listCountries>> = [];
  let earliest: string | null = null;
  let latest: string | null = null;
  try {
    [races, countries, earliest, latest] = await Promise.all([
      listRacesForMonth(month),
      listCountries(),
      getEarliestUpcomingMonth(),
      getLatestUpcomingMonth(),
    ]);
  } catch {
    /* ignore — we'll render an empty state */
  }

  // If the current month is empty AND the user landed without explicitly
  // picking a month, redirect-style hint by showing the earliest upcoming
  // month directly. (We don't redirect on the server because URL stickiness
  // matters when users share /calendar links.)
  const showEarliestHint =
    !requested && races.length === 0 && earliest !== null && earliest !== month;

  return (
    <div className="container-wide py-10 sm:py-14">
      <header className="mb-8 max-w-2xl">
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-fg-muted">{t("subtitle")}</p>
      </header>

      {races.length === 0 && !showEarliestHint && !earliest ? (
        <EmptyState icon={<CalendarIcon className="size-8" />} title={t("no_upcoming")} />
      ) : (
        <CalendarGrid
          month={month}
          prevMonth={shiftMonth(month, -1)}
          nextMonth={shiftMonth(month, 1)}
          earliestMonth={earliest}
          latestMonth={latest}
          races={races}
          availableCountries={countries}
          initialSelectedCountries={initialCountries}
        />
      )}
    </div>
  );
}
