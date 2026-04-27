"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { countryName } from "@/lib/format/country";
import { readPrefsFromDocument, writePrefsToDocument } from "@/lib/prefs/filter-prefs";
import type { CountryStats, PrimaryType } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { CountryPicker } from "./CountryPicker";

const PRIMARY_TYPES: PrimaryType[] = ["road_marathon", "trail", "ultra", "mixed", "virtual"];

export function FilterBar({ availableCountries }: { availableCountries: CountryStats[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");
  const t = useTranslations("races");
  const tType = useTranslations("primary_type");
  const locale = useLocale();

  const types = (params.get("type") ?? "").split(",").filter(Boolean);
  const countries = (params.get("country") ?? "").split(",").filter(Boolean);
  const onlyReg = params.get("reg") === "1";

  const update = useCallback(
    (mut: (sp: URLSearchParams) => void) => {
      const sp = new URLSearchParams(params);
      mut(sp);
      sp.delete("offset");
      const qs = sp.toString();
      start(() => router.replace(`?${qs}`, { scroll: false }));
    },
    [params, router],
  );

  const toggleMulti = (key: string, value: string) => {
    const current = (params.get(key) ?? "").split(",").filter(Boolean);
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    update((sp) => {
      if (next.length) sp.set(key, next.join(","));
      else sp.delete(key);
    });
  };

  const setOnlyReg = (v: boolean) => update((sp) => (v ? sp.set("reg", "1") : sp.delete("reg")));

  const clearAll = () => {
    setQ("");
    router.replace(window.location.pathname, { scroll: false });
  };

  // Persist current filter state to cookie whenever URL changes.
  // Merge with existing prefs so we don't wipe other fields written by
  // sibling pages (e.g., calendar's type filter, home interests sync).
  // biome-ignore lint/correctness/useExhaustiveDependencies: derived strings cover deps
  useEffect(() => {
    const existing = readPrefsFromDocument() ?? {};
    writePrefsToDocument({
      ...existing,
      countries: countries.length ? countries : undefined,
      types: types.length ? (types as PrimaryType[]) : undefined,
      onlyWithRegistration: onlyReg || undefined,
      dateFrom: params.get("from") ?? undefined,
      dateTo: params.get("to") ?? undefined,
    });
  }, [countries.join(","), types.join(","), onlyReg, params]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    update((sp) => (q ? sp.set("q", q) : sp.delete("q")));
  };

  const hasActive = countries.length > 0 || types.length > 0 || onlyReg;
  const activeCount = countries.length + types.length + (onlyReg ? 1 : 0);

  // ── Mobile staged filter state ──────────────────────────────────────
  // The mobile sheet collects selections without committing each tap to
  // the URL. Apply button commits everything at once, Cancel discards.
  const [sheetOpen, setSheetOpen] = useState(false);
  const [stagedTypes, setStagedTypes] = useState<string[]>(types);
  const [stagedCountries, setStagedCountries] = useState<string[]>(countries);
  const [stagedOnlyReg, setStagedOnlyReg] = useState<boolean>(onlyReg);

  // Re-seed staging from URL each time the sheet opens.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional snapshot at open
  useEffect(() => {
    if (sheetOpen) {
      setStagedTypes(types);
      setStagedCountries(countries);
      setStagedOnlyReg(onlyReg);
    }
  }, [sheetOpen]);

  const stagedToggle = (key: string, value: string) => {
    if (key === "type") {
      setStagedTypes((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
      );
    } else if (key === "country") {
      setStagedCountries((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
      );
    }
  };

  const clearStaged = () => {
    setStagedTypes([]);
    setStagedCountries([]);
    setStagedOnlyReg(false);
  };

  const applyStaged = () => {
    update((sp) => {
      if (stagedCountries.length) sp.set("country", stagedCountries.join(","));
      else sp.delete("country");
      if (stagedTypes.length) sp.set("type", stagedTypes.join(","));
      else sp.delete("type");
      if (stagedOnlyReg) sp.set("reg", "1");
      else sp.delete("reg");
      // Also apply the in-flight search query so user-typed input doesn't
      // get silently dropped when they hit Apply on the mobile sheet.
      if (q) sp.set("q", q);
      else sp.delete("q");
    });
    setSheetOpen(false);
  };

  const stagedCount = stagedCountries.length + stagedTypes.length + (stagedOnlyReg ? 1 : 0);

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("search_placeholder")}
            className="pl-9"
            aria-label={t("search_button")}
          />
        </div>
        <Button type="submit" disabled={pending}>
          {t("search_button")}
        </Button>

        {/* Mobile filter sheet — staged selection + apply button */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden gap-1.5" aria-label={t("filter_open")}>
              <SlidersHorizontal className="size-4" />
              {activeCount > 0 && (
                <span className="rounded-full bg-accent/20 px-1.5 py-0.5 text-[10px] tabular text-accent">
                  {activeCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="flex h-[90vh] flex-col rounded-t-2xl p-0">
            <SheetHeader className="border-b border-border p-4">
              <SheetTitle>{t("filter_open")}</SheetTitle>
              <SheetDescription>{t("subtitle")}</SheetDescription>
            </SheetHeader>
            <ScrollArea className="flex-1">
              <div className="space-y-6 p-4 pb-6">
                <FilterGroups
                  types={stagedTypes}
                  countries={stagedCountries}
                  onlyReg={stagedOnlyReg}
                  availableCountries={availableCountries}
                  onToggle={stagedToggle}
                  onClearCountries={() => setStagedCountries([])}
                  onSetOnlyReg={setStagedOnlyReg}
                />
              </div>
            </ScrollArea>
            {/* Sticky action bar */}
            <div className="border-t border-border bg-surface p-3 flex gap-2">
              <Button
                variant="outline"
                size="lg"
                onClick={clearStaged}
                disabled={stagedCount === 0}
                className="flex-1"
              >
                {t("filter_clear")}
              </Button>
              <Button size="lg" onClick={applyStaged} className="flex-[2]">
                {t("filter_apply")}
                {stagedCount > 0 && (
                  <span className="ml-1 rounded-full bg-accent-fg/20 px-1.5 py-0.5 text-[10px] tabular">
                    {stagedCount}
                  </span>
                )}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </form>

      <div className="hidden lg:block">
        <FilterGroups
          types={types}
          countries={countries}
          onlyReg={onlyReg}
          availableCountries={availableCountries}
          onToggle={toggleMulti}
          onClearCountries={() =>
            update((sp) => {
              sp.delete("country");
            })
          }
          onSetOnlyReg={setOnlyReg}
        />
      </div>

      {hasActive && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {countries.map((c) => (
            <Badge
              key={`c-${c}`}
              variant="accent"
              className="cursor-pointer gap-1 pl-2 pr-1"
              onClick={() => toggleMulti("country", c)}
            >
              {countryName(c, locale, null)}
              <X className="size-3" />
            </Badge>
          ))}
          {types.map((tt) => (
            <Badge
              key={`t-${tt}`}
              variant="accent"
              className="cursor-pointer gap-1 pl-2 pr-1"
              onClick={() => toggleMulti("type", tt)}
            >
              {tType(tt as PrimaryType)}
              <X className="size-3" />
            </Badge>
          ))}
          {onlyReg && (
            <Badge
              variant="accent"
              className="cursor-pointer gap-1 pl-2 pr-1"
              onClick={() => setOnlyReg(false)}
            >
              {t("filter_only_registration")}
              <X className="size-3" />
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="ml-auto text-xs text-fg-muted"
          >
            {t("filter_clear")}
          </Button>
        </div>
      )}
    </div>
  );
}

interface GroupsProps {
  types: string[];
  countries: string[];
  onlyReg: boolean;
  availableCountries: CountryStats[];
  onToggle: (key: string, value: string) => void;
  onClearCountries: () => void;
  onSetOnlyReg: (v: boolean) => void;
}

function FilterGroups({
  types,
  countries,
  onlyReg,
  availableCountries,
  onToggle,
  onClearCountries,
  onSetOnlyReg,
}: GroupsProps) {
  const t = useTranslations("races");
  const tType = useTranslations("primary_type");

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-wider text-fg-subtle mb-2">
          {t("filter_type")}
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {PRIMARY_TYPES.map((tt) => {
            const active = types.includes(tt);
            return (
              <button
                type="button"
                key={tt}
                onClick={() => onToggle("type", tt)}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border text-fg-muted hover:border-accent/40 hover:text-fg",
                )}
              >
                {tType(tt)}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-wider text-fg-subtle mb-2">
          {t("filter_country")}
        </legend>
        <CountryPicker
          available={availableCountries}
          selected={countries}
          onToggle={(c) => onToggle("country", c)}
          onClear={onClearCountries}
        />
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-wider text-fg-subtle mb-2">
          {t("filter_other")}
        </legend>
        <label className="flex items-center gap-2 text-sm text-fg-muted cursor-pointer">
          <input
            type="checkbox"
            checked={onlyReg}
            onChange={(e) => onSetOnlyReg(e.target.checked)}
            className="size-4 rounded border-border-strong text-accent focus:ring-accent"
          />
          {t("filter_only_registration")}
        </label>
      </fieldset>
    </div>
  );
}
