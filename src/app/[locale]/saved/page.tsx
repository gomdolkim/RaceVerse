import { EmptyState } from "@/components/feedback/EmptyState";
import { RaceList } from "@/components/race/RaceList";
import { SavedActions } from "@/components/saved/SavedActions";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/routing";
import { SAVED_COOKIE, parseIdsParam, parseSaved } from "@/lib/prefs/saved";
import { listRacesByIds } from "@/lib/queries/races";
import { ArrowRight, Heart } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SavedPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("saved");

  const sp = await searchParams;
  const sharedIdsRaw = typeof sp.ids === "string" ? sp.ids : undefined;
  const sharedIds = parseIdsParam(sharedIdsRaw);
  const isSharedView = sharedIds.length > 0;

  // ?ids= takes precedence over the user's own cookie — that's the share view.
  let ids: string[];
  if (isSharedView) {
    ids = sharedIds;
  } else {
    const cookieStore = await cookies();
    ids = parseSaved(cookieStore.get(SAVED_COOKIE)?.value);
  }

  const races = ids.length > 0 ? await listRacesByIds(ids).catch(() => []) : [];

  return (
    <div className="container-wide py-10 sm:py-14">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Heart className="size-5 text-accent" fill="currentColor" />
            <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
              {isSharedView ? t("shared_view_title") : t("title")}
            </h1>
          </div>
          <p className="mt-2 text-fg-muted">
            {isSharedView ? t("shared_view_desc") : t("subtitle")}
          </p>
          {races.length > 0 && (
            <p className="mt-1 text-xs text-fg-subtle tabular">
              {t("count_label", { count: races.length })}
            </p>
          )}
        </div>
        <SavedActions
          isSharedView={isSharedView}
          sharedIds={isSharedView ? sharedIds : null}
          hasItems={races.length > 0}
        />
      </header>

      {races.length === 0 ? (
        <EmptyState
          icon={<Heart className="size-8" />}
          title={t("empty_title")}
          description={t("empty_desc")}
          action={
            <Button asChild>
              <Link href="/races">
                {t("empty_cta")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          }
        />
      ) : (
        <RaceList races={races} />
      )}
    </div>
  );
}
