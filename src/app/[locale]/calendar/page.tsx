import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { EmptyState } from "@/components/feedback/EmptyState";
import { listRaces } from "@/lib/queries/races";
import { Calendar as CalendarIcon } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const revalidate = 1800;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function CalendarPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("calendar");

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
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-fg-muted">{t("subtitle")}</p>
      </header>

      {races.data.length === 0 ? (
        <EmptyState icon={<CalendarIcon className="size-8" />} title={t("no_upcoming")} />
      ) : (
        <CalendarGrid races={races.data} />
      )}
    </div>
  );
}
