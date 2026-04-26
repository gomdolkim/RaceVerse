"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CountryFlag } from "@/components/race/CountryFlag";
import { countryName } from "@/lib/format/country";
import type { CountryStats } from "@/lib/supabase/types";
import { cn, formatNumber } from "@/lib/utils";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

interface Props {
  available: CountryStats[];
  selected: string[];
  onToggle: (code: string) => void;
  onClear: () => void;
}

export function CountryPicker({ available, selected, onToggle, onClear }: Props) {
  const locale = useLocale();
  const t = useTranslations("races");
  const tNav = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <span>{t("filter_country")}</span>
          {selected.length > 0 && (
            <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] tabular text-accent">
              {selected.length}
            </span>
          )}
          <ChevronDown className="size-3.5 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px] p-0">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Search className="size-4 text-fg-subtle" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tNav("search_placeholder")}
            className="h-9 border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-fg-subtle hover:text-fg"
              aria-label="Clear"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <ScrollArea className="h-[320px]">
          <ul className="p-1">
            {filtered.map((c) => {
              const isSelected = selected.includes(c.country_code);
              return (
                <li key={c.country_code}>
                  <button
                    type="button"
                    onClick={() => onToggle(c.country_code)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-left transition-colors",
                      isSelected
                        ? "bg-accent/15 text-accent"
                        : "hover:bg-surface-raised",
                    )}
                  >
                    <CountryFlag code={c.country_code} size={20} />
                    <span className="flex-1 min-w-0 truncate">
                      {countryName(c.country_code, locale, c.country_name)}
                    </span>
                    <span className="text-xs text-fg-subtle tabular">
                      {formatNumber(c.race_count, locale)}
                    </span>
                    {isSelected && <Check className="size-4" />}
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="py-6 text-center text-sm text-fg-subtle">
                {t("no_results")}
              </li>
            )}
          </ul>
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
