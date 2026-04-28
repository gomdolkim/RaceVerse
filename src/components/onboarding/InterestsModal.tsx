"use client";

import { CountryPicker } from "@/components/filter/CountryPicker";
import { CountryFlag } from "@/components/race/CountryFlag";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { countryName } from "@/lib/format/country";
import { readPrefsFromDocument, writePrefsToDocument } from "@/lib/prefs/filter-prefs";
import {
  readInterestsFromDocument,
  writeInterestsToDocument,
} from "@/lib/prefs/interests";
import type { CountryStats } from "@/lib/supabase/types";
import { Heart, Sparkles, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

/**
 * Pages where we don't want to interrupt the user with the modal.
 * Legal pages, error states, and the saved share view are intentionally
 * skipped to avoid friction.
 */
const SKIP_PATTERNS = ["/legal", "/about"];

/**
 * Global first-visit modal. Mounts once in the locale layout. Reads the
 * `interests` cookie on mount; if it has never been set (`null`), opens
 * a dialog asking the user to pick favorite countries. Writes both the
 * `interests` cookie (home tracking) and the `filter_prefs` cookie
 * (used by /races and /calendar) so all surfaces reflect the choice.
 */
export function InterestsModal() {
  const t = useTranslations("home");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const [open, setOpen] = useState(false);
  const [countries, setCountries] = useState<CountryStats[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Decide whether to show the modal — only when cookie is absent AND we're
  // not on a skip-listed page.
  useEffect(() => {
    if (SKIP_PATTERNS.some((p) => pathname.includes(p))) return;
    const existing = readInterestsFromDocument();
    if (existing !== null) return; // already set or skipped previously
    setOpen(true);
  }, [pathname]);

  // Lazy-fetch countries only when modal opens.
  useEffect(() => {
    if (!open || countries.length > 0) return;
    setLoading(true);
    fetch("/api/countries")
      .then((r) => r.json())
      .then((json) => {
        setCountries(json.data ?? []);
      })
      .catch(() => {
        /* leave empty; user can still skip */
      })
      .finally(() => setLoading(false));
  }, [open, countries.length]);

  function toggle(code: string) {
    setSelected((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  }

  function syncToFilterPrefs(values: string[]) {
    const existing = readPrefsFromDocument() ?? {};
    writePrefsToDocument({
      ...existing,
      countries: values.length ? values : undefined,
    });
  }

  function save() {
    writeInterestsToDocument(selected);
    syncToFilterPrefs(selected);
    setOpen(false);
    startTransition(() => router.refresh());
  }

  function skip() {
    // Empty array marker = "user said no thanks, don't ask again".
    writeInterestsToDocument([]);
    setOpen(false);
    startTransition(() => router.refresh());
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && skip()}>
      <DialogContent className="max-w-lg overflow-hidden p-0 sm:rounded-2xl">
        <div className="relative bg-gradient-to-br from-accent/15 via-accent/5 to-transparent p-6 sm:p-7">
          <span className="grid size-10 place-items-center rounded-full bg-accent/20 ring-1 ring-inset ring-accent/30">
            <Heart className="size-5 text-accent" fill="currentColor" />
          </span>
          <DialogHeader className="mt-4 text-left">
            <DialogTitle className="font-display text-2xl tracking-tight sm:text-3xl">
              {t("interests_empty_title")}
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm leading-relaxed text-fg-muted">
              {t("interests_empty_desc")}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 sm:px-7 sm:pb-7">
          <div className="flex flex-wrap items-center gap-2">
            <CountryPicker
              available={countries}
              selected={selected}
              onToggle={toggle}
              onClear={() => setSelected([])}
            />
            {loading && (
              <span className="text-xs text-fg-subtle">{tNav("search")}…</span>
            )}
          </div>

          {selected.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
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
          )}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              onClick={skip}
              disabled={pending}
              className="sm:w-auto"
            >
              {t("interests_skip")}
            </Button>
            <Button
              onClick={save}
              disabled={selected.length === 0 || pending}
              className="sm:w-auto"
            >
              <Sparkles className="size-4" />
              {t("interests_save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
