"use client";

import { CountryPicker } from "@/components/filter/CountryPicker";
import { CountryFlag } from "@/components/race/CountryFlag";
import { RaceList } from "@/components/race/RaceList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { countryName } from "@/lib/format/country";
import { Link } from "@/lib/i18n/routing";
import { readPrefsFromDocument, writePrefsToDocument } from "@/lib/prefs/filter-prefs";
import { writeInterestsToDocument } from "@/lib/prefs/interests";
import type { CountryStats, RaceWithNextEdition } from "@/lib/supabase/types";
import { ArrowRight, Heart, Pencil, Sparkles, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface Props {
  /** null = cookie absent (first visit). [] = explicitly skipped. otherwise = saved interests. */
  initialInterests: string[] | null;
  availableCountries: CountryStats[];
  /** Server-fetched races filtered by current interests (empty if interests is null/[]). */
  races: RaceWithNextEdition[];
}

export function InterestsSection({ initialInterests, availableCountries, races }: Props) {
  const t = useTranslations("home");
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // First-visit onboarding now happens in the global <InterestsModal />.
  // The home section only handles two states for already-onboarded users:
  // - editing → inline picker
  // - has saved interests → display mode
  const savedInterests = initialInterests ?? [];

  const [selected, setSelected] = useState<string[]>(savedInterests);
  const [editing, setEditing] = useState(false);

  // Keep showing the picker while the post-save router refresh is pending,
  // so we don't flash the old race list between save and re-render.
  const showPicker = editing || pending;

  /**
   * Sync interests → filter cookie so /races and /calendar pre-filter to
   * these countries automatically. Other filter fields (types, dates) are
   * preserved if the user had any.
   */
  function syncToFilterPrefs(countries: string[]) {
    const existing = readPrefsFromDocument() ?? {};
    writePrefsToDocument({
      ...existing,
      countries: countries.length ? countries : undefined,
    });
  }

  function save() {
    writeInterestsToDocument(selected);
    syncToFilterPrefs(selected);
    startTransition(() => {
      router.refresh();
    });
    // Defer setEditing(false) — `pending` keeps the picker visible until the
    // server re-render completes, so the UI doesn't flash the old state.
    setEditing(false);
  }

  function cancel() {
    setSelected(savedInterests);
    setEditing(false);
  }

  function toggle(code: string) {
    setSelected((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  // Picker UI (first visit OR editing)
  if (showPicker) {
    return (
      <section className="container-wide mt-8 sm:mt-12">
        <div className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 via-accent/3 to-transparent p-5 sm:p-7">
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent/15 ring-1 ring-inset ring-accent/30">
              <Heart className="size-4 text-accent" />
            </span>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-xl sm:text-2xl tracking-tight">
                {t("interests_empty_title")}
              </h2>
              <p className="mt-1 text-sm text-fg-muted leading-relaxed">
                {t("interests_empty_desc")}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <CountryPicker
              available={availableCountries}
              selected={selected}
              onToggle={toggle}
              onClear={() => setSelected([])}
            />
            {selected.map((c) => (
              <Badge
                key={c}
                variant="accent"
                className="cursor-pointer gap-1 pl-2 pr-1"
                onClick={() => toggle(c)}
              >
                <CountryFlag code={c} size={12} />
                <span>{countryName(c, locale, null)}</span>
                <X className="size-3" />
              </Badge>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={save} disabled={selected.length === 0 || pending}>
              <Sparkles className="size-4" />
              {t("interests_save")}
            </Button>
            <Button variant="ghost" onClick={cancel} disabled={pending}>
              {t("interests_cancel")}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // Skipped (cookie set to []) or unset and not first visit — render nothing.
  if (savedInterests.length === 0) return null;

  // Has interests: show selected countries + filtered races + edit button.
  return (
    <section className="container-wide mt-12 sm:mt-16">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Heart className="size-4 text-accent" />
            <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
              {t("interests_title")}
            </h2>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {savedInterests.map((c) => (
              <Badge key={c} variant="accent" className="gap-1">
                <CountryFlag code={c} size={12} />
                <span>{countryName(c, locale, null)}</span>
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="gap-1.5">
            <Pencil className="size-3.5" />
            {t("interests_edit")}
          </Button>
        </div>
      </header>

      {races.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-fg-muted">
          {t("interests_no_races")}
        </p>
      ) : (
        <>
          <RaceList races={races} />
          <div className="mt-6 flex justify-center">
            <Button asChild variant="outline">
              <Link href={`/races?country=${savedInterests.join(",")}`}>
                {t("interests_see_all")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
