"use client";

import { CountryFlag } from "@/components/race/CountryFlag";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { countryName } from "@/lib/format/country";
import { shortDate } from "@/lib/format/date";
import { Calendar, Globe, Map, Mountain, Trophy } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SearchHit {
  id: string;
  slug: string;
  name: string;
  country_code: string | null;
  country_name: string | null;
  city: string | null;
  event_date: string | null;
  primary_type: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("command");

  const QUICK_LINKS = [
    { href: "/races", icon: Trophy, label: t("browse_all") },
    { href: "/calendar", icon: Calendar, label: t("view_calendar") },
    { href: "/map", icon: Map, label: t("view_map") },
    { href: "/countries", icon: Globe, label: t("view_countries") },
    { href: "/trail", icon: Mountain, label: t("view_trail") },
  ];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "/" && !open) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag !== "INPUT" && tag !== "TEXTAREA") {
          e.preventDefault();
          setOpen(true);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!q || q.length < 2) {
      setHits([]);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const tid = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        const json = await res.json();
        setHits(json.data ?? []);
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      ctrl.abort();
      clearTimeout(tid);
    };
  }, [q]);

  const goto = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 max-w-xl">
        <Command shouldFilter={false}>
          <CommandInput placeholder={t("placeholder")} value={q} onValueChange={setQ} />
          <CommandList>
            {q.length >= 2 && hits.length === 0 && !loading && (
              <CommandEmpty>{t("no_results")}</CommandEmpty>
            )}
            {q.length < 2 && (
              <CommandGroup heading={t("quick_links")}>
                {QUICK_LINKS.map((link) => {
                  const Icon = link.icon;
                  return (
                    <CommandItem
                      key={link.href}
                      onSelect={() => goto(link.href)}
                      value={link.label}
                    >
                      <Icon className="size-4 text-fg-subtle" />
                      {link.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
            {hits.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading={t("results_count", { count: hits.length })}>
                  {hits.map((h) => (
                    <CommandItem
                      key={h.id}
                      onSelect={() => goto(`/races/${h.slug}`)}
                      value={`${h.name} ${h.country_code ?? ""} ${h.city ?? ""}`}
                    >
                      <CountryFlag code={h.country_code} size={18} />
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{h.name}</p>
                        <p className="truncate text-xs text-fg-subtle tabular">
                          {countryName(h.country_code, locale, h.country_name)}
                          {h.city && ` · ${h.city}`}
                          {h.event_date && ` · ${shortDate(h.event_date, locale)}`}
                        </p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
