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
import { countryNameKo } from "@/lib/format/country";
import { formatEventDate } from "@/lib/format/date";
import { Link } from "@/lib/i18n/routing";
import { Calendar, Globe, Map, Mountain, Trophy } from "lucide-react";
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

const QUICK_LINKS = [
  { href: "/races", icon: Trophy, label: "전체 대회 둘러보기" },
  { href: "/calendar", icon: Calendar, label: "캘린더 보기" },
  { href: "/map", icon: Map, label: "지도에서 보기" },
  { href: "/countries", icon: Globe, label: "국가별 보기" },
  { href: "/trail", icon: Mountain, label: "트레일 / 울트라" },
] as const;

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
          <CommandInput
            placeholder="대회·도시·국가 검색 (예: tokyo, KR, marathon)"
            value={q}
            onValueChange={setQ}
          />
          <CommandList>
            {q.length >= 2 && hits.length === 0 && !loading && (
              <CommandEmpty>검색 결과가 없습니다</CommandEmpty>
            )}
            {q.length < 2 && (
              <CommandGroup heading="빠른 이동">
                {QUICK_LINKS.map((q) => {
                  const Icon = q.icon;
                  return (
                    <CommandItem key={q.href} onSelect={() => goto(q.href)} value={q.label}>
                      <Icon className="size-4 text-fg-subtle" />
                      {q.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
            {hits.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading={`결과 ${hits.length}개`}>
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
                          {countryNameKo(h.country_code, h.country_name)}
                          {h.city && ` · ${h.city}`}
                          {h.event_date && ` · ${formatEventDate(h.event_date, "yyyy.MM.dd")}`}
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

/** Hidden link wrapper exposed for tests/keyboard nav. */
export function CommandPaletteTriggerLink() {
  return (
    <Link href="#" className="sr-only">
      Open command palette (Cmd+K)
    </Link>
  );
}
