"use client";

import { CountryFlag } from "@/components/race/CountryFlag";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import type { CountryStats } from "@/lib/supabase/types";
import { cn, formatNumber } from "@/lib/utils";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";

interface Props {
  available: CountryStats[];
  selected: string[];
  onToggle: (code: string) => void;
  onClear: () => void;
}

/** Simple SSR-safe media query hook (defaults to desktop until mounted). */
function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);
  return isMobile;
}

export function CountryPicker({ available, selected, onToggle, onClear }: Props) {
  const locale = useLocale();
  const t = useTranslations("races");
  const tNav = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const isMobile = useIsMobile();

  const sorted = useMemo(
    () =>
      [...available].sort((a, b) => {
        const aSel = selected.includes(a.country_code) ? -1 : 0;
        const bSel = selected.includes(b.country_code) ? -1 : 0;
        if (aSel !== bSel) return aSel - bSel;
        return b.race_count - a.race_count;
      }),
    [available, selected],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return sorted;
    const q = query.trim().toLowerCase();
    return sorted.filter((c) => {
      const ko = countryName(c.country_code, "ko").toLowerCase();
      const en = countryName(c.country_code, "en").toLowerCase();
      const code = c.country_code.toLowerCase();
      return ko.includes(q) || en.includes(q) || code.includes(q);
    });
  }, [sorted, query]);

  const trigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <span>{t("filter_country")}</span>
      {selected.length > 0 && (
        <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] tabular text-accent">
          {selected.length}
        </span>
      )}
      <ChevronDown className="size-3.5 opacity-60" />
    </Button>
  );

  const list = (
    <PickerList
      filtered={filtered}
      selected={selected}
      locale={locale}
      onToggle={onToggle}
      emptyLabel={t("no_results")}
    />
  );

  if (isMobile) {
    // Mobile: full-width bottom sheet — large touch targets, native-feeling.
    return (
      <Sheet
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setQuery("");
        }}
      >
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent side="bottom" className="flex h-[85vh] flex-col rounded-t-2xl p-0">
          <SheetHeader className="border-b border-border p-4">
            <SheetTitle className="font-display text-xl">{t("filter_country")}</SheetTitle>
            <SheetDescription className="text-xs">
              {selected.length > 0
                ? t("results_count", { count: selected.length })
                : t("subtitle")}
            </SheetDescription>
            <SearchBox
              value={query}
              onChange={setQuery}
              placeholder={tNav("search_placeholder")}
              autoFocus
            />
          </SheetHeader>
          <ScrollArea className="flex-1">
            <div className="p-2 pb-24">{list}</div>
          </ScrollArea>
          {/* Sticky action bar: clear + done */}
          <div className="border-t border-border bg-surface p-3 flex gap-2">
            {selected.length > 0 && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  onClear();
                  setQuery("");
                }}
                className="flex-1"
              >
                {t("filter_clear")}
              </Button>
            )}
            <Button size="lg" onClick={() => setOpen(false)} className="flex-1">
              {t("filter_apply")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: keep the anchored popover for compactness.
  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setQuery("");
      }}
    >
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="start" className="w-[340px] p-0">
        <div className="border-b border-border px-3 py-2">
          <SearchBox
            value={query}
            onChange={setQuery}
            placeholder={tNav("search_placeholder")}
          />
        </div>
        <ScrollArea className="h-[360px]">
          <div className="p-1">{list}</div>
        </ScrollArea>
        {selected.length > 0 && (
          <div className="border-t border-border p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onClear();
                setQuery("");
              }}
              className="w-full justify-center text-xs text-fg-muted"
            >
              {t("filter_clear")}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function SearchBox({
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoFocus?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (autoFocus) {
      // Delay so it works inside Sheet animation
      const tid = setTimeout(() => ref.current?.focus(), 100);
      return () => clearTimeout(tid);
    }
  }, [autoFocus]);
  return (
    <div className="flex items-center gap-2">
      <Search className="size-4 text-fg-subtle shrink-0" />
      <Input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        inputMode="search"
        className="h-10 border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-fg-subtle hover:text-fg p-1"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

function PickerList({
  filtered,
  selected,
  locale,
  onToggle,
  emptyLabel,
}: {
  filtered: CountryStats[];
  selected: string[];
  locale: string;
  onToggle: (code: string) => void;
  emptyLabel: string;
}) {
  if (filtered.length === 0) {
    return <p className="py-10 text-center text-sm text-fg-subtle">{emptyLabel}</p>;
  }
  return (
    <ul>
      {filtered.map((c) => {
        const isSelected = selected.includes(c.country_code);
        return (
          <li key={c.country_code}>
            <button
              type="button"
              onClick={() => onToggle(c.country_code)}
              className={cn(
                // Mobile-friendly touch target: ≥48px height
                "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-base text-left transition-colors",
                "active:bg-surface-overlay",
                isSelected
                  ? "bg-accent/15 text-accent"
                  : "hover:bg-surface-raised",
              )}
            >
              <CountryFlag code={c.country_code} size={24} />
              <span className="flex-1 min-w-0 truncate">
                {countryName(c.country_code, locale, c.country_name)}
              </span>
              <span className="text-xs text-fg-subtle tabular">
                {formatNumber(c.race_count, locale)}
              </span>
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full border transition-colors",
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
  );
}
