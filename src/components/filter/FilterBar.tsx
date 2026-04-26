"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { countryName } from "@/lib/format/country";
import { writePrefsToDocument } from "@/lib/prefs/filter-prefs";
import type { CountryStats, PrimaryType } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { CountryPicker } from "./CountryPicker";

const PRIMARY_TYPES: PrimaryType[] = [
  "road_marathon",
  "road_other",
  "trail",
  "ultra",
  "mixed",
  "virtual",
];

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
  // biome-ignore lint/correctness/useExhaustiveDependencies: derived strings cover deps
  useEffect(() => {
    writePrefsToDocument({
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
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden" aria-label={t("filter_open")}>
              <SlidersHorizontal className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{t("filter_open")}</SheetTitle>
              <SheetDescription>{t("subtitle")}</SheetDescription>
            </SheetHeader>
            <div className="px-6 pb-6 space-y-6">
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
                  "rounded-full border px-3 py-1 text-xs transition-colors",
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
