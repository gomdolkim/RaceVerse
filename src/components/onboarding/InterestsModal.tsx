"use client";

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
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { countryName } from "@/lib/format/country";
import { readPrefsFromDocument, writePrefsToDocument } from "@/lib/prefs/filter-prefs";
import { readInterestsFromDocument, writeInterestsToDocument } from "@/lib/prefs/interests";
import type { CountryStats } from "@/lib/supabase/types";
import { cn, formatNumber } from "@/lib/utils";
import { Check, Heart, Search, Sparkles, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

/**
 * Pages where we don't want to interrupt the user with the modal.
 */
const SKIP_PATTERNS = ["/legal", "/about"];

/**
 * Global first-visit modal. Renders the country picker INLINE inside the
 * dialog rather than via a nested Popover — Popover-inside-Dialog has
 * known Radix focus-trap interactions that can hide the search input.
 */
export function InterestsModal() {
  const t = useTranslations("home");
  const tRaces = useTranslations("races");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const [open, setOpen] = useState(false);
  const [countries, setCountries] = useState<CountryStats[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Show the modal only when cookie is absent AND we're not on a skip-listed page.
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
        /* leave empty */
      })
      .finally(() => setLoading(false));
  }, [open, countries.length]);

  // Sort: selected first, then by race_count desc.
  const sorted = useMemo(() => {
    return [...countries].sort((a, b) => {
      const aSel = selected.includes(a.country_code) ? -1 : 0;
      const bSel = selected.includes(b.country_code) ? -1 : 0;
      if (aSel !== bSel) return aSel - bSel;
      return b.race_count - a.race_count;
    });
  }, [countries, selected]);

  // Filter by search query (KO / EN / ISO code).
  const filtered = useMemo(() => {
    if (!query.trim()) return sorted;
    const q = query.trim().toLowerCase();
    return sorted.filter((c) => {
      const ko = countryName(c.country_code, "ko").toLowerCase();
      const en = countryName(c.country_code, "en").toLowerCase();
      return (
        ko.includes(q) || en.includes(q) || c.country_code.toLowerCase().includes(q)
      );
    });
  }, [sorted, query]);

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
    writeInterestsToDocument([]);
    setOpen(false);
    startTransition(() => router.refresh());
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && skip()}>
      <DialogContent className="max-w-lg overflow-hidden p-0 sm:rounded-2xl">
        {/* Header */}
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

        {/* Inline picker — search + scrollable list directly inside the modal */}
        <div className="flex flex-col gap-3 px-6 pb-6 sm:px-7 sm:pb-7">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3">
            <Search className="size-4 shrink-0 text-fg-subtle" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tRaces("search_placeholder")}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              inputMode="search"
              className="h-10 border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="p-1 text-fg-subtle hover:text-fg"
                aria-label="Clear"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Selected chips row */}
          {selected.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelected([])}
                className="ml-auto text-xs text-fg-muted"
              >
                {tRaces("filter_clear")}
              </Button>
            </div>
          )}

          <ScrollArea className="h-[280px] rounded-lg border border-border bg-surface">
            <ul className="p-1">
              {loading && (
                <li className="py-8 text-center text-sm text-fg-subtle">…</li>
              )}
              {!loading && filtered.length === 0 && (
                <li className="py-8 text-center text-sm text-fg-subtle">
                  {tRaces("no_results")}
                </li>
              )}
              {filtered.map((c) => {
                const isSelected = selected.includes(c.country_code);
                return (
                  <li key={c.country_code}>
                    <button
                      type="button"
                      onClick={() => toggle(c.country_code)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-left transition-colors",
                        "active:bg-surface-overlay",
                        isSelected
                          ? "bg-accent/15 text-accent"
                          : "hover:bg-surface-raised",
                      )}
                    >
                      <CountryFlag code={c.country_code} size={20} />
                      <span className="min-w-0 flex-1 truncate">
                        {countryName(c.country_code, locale, c.country_name)}
                      </span>
                      <span className="text-xs text-fg-subtle tabular">
                        {formatNumber(c.race_count, locale)}
                      </span>
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                          isSelected
                            ? "border-accent bg-accent text-accent-fg"
                            : "border-border",
                        )}
                      >
                        {isSelected && <Check className="size-3" />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>

          {/* Action bar */}
          <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
