import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { EmptyState } from "@/components/feedback/EmptyState";
import { listRaces } from "@/lib/queries/races";
import { Calendar as CalendarIcon } from "lucide-react";
import { setRequestLocale } from "next-intl/server";

export const revalidate = 1800;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function CalendarPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Pull next ~6 months of races
  const today = new Date();
  const sixMonths = new Date(today);
  sixMonths.setMonth(today.getMonth() + 6);

  let races: Awaited<ReturnType<typeof listRaces>> = { data: [], count: 0 };
  try {
    races = await listRaces({
      dateFrom: today.toISOString().slice(0, 10),
      dateTo: sixMonths.toISOString().slice(0, 10),
      limit: 500,
    });
  } catch {
    /* ignore */
  }

  return (
    <div className="container-wide py-10 sm:py-14">
      <header className="mb-8 max-w-2xl">
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">대회 캘린더</h1>
        <p className="mt-2 text-fg-muted">앞으로 6개월 동안 열리는 대회를 한눈에</p>
      </header>

      {races.data.length === 0 ? (
        <EmptyState icon={<CalendarIcon className="size-8" />} title="예정된 대회가 없습니다" />
      ) : (
        <CalendarGrid races={races.data} />
      )}
    </div>
  );
}
