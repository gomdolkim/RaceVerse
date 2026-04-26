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
import { PRIMARY_TYPES, PRIMARY_TYPE_LABEL_KO } from "@/lib/format/race";
import type { PrimaryType } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

const TOP_COUNTRIES: { code: string; label: string }[] = [
  { code: "KR", label: "🇰🇷 한국" },
  { code: "JP", label: "🇯🇵 일본" },
  { code: "US", label: "🇺🇸 미국" },
  { code: "GB", label: "🇬🇧 영국" },
  { code: "FR", label: "🇫🇷 프랑스" },
  { code: "DE", label: "🇩🇪 독일" },
  { code: "IT", label: "🇮🇹 이탈리아" },
  { code: "ES", label: "🇪🇸 스페인" },
  { code: "CH", label: "🇨🇭 스위스" },
  { code: "AU", label: "🇦🇺 호주" },
  { code: "CA", label: "🇨🇦 캐나다" },
];

export function FilterBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");

  const update = useCallback(
    (mut: (sp: URLSearchParams) => void) => {
      const sp = new URLSearchParams(params);
      mut(sp);
      sp.delete("offset");
      const qs = sp.toString();
      start(() => router.replace(`?${qs}`, { scroll: false }));
    },
    [params, router, start],
  );

  const toggleMulti = (key: string, value: string) => {
    const current = (params.get(key) ?? "").split(",").filter(Boolean);
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    update((sp) => {
      if (next.length) sp.set(key, next.join(","));
      else sp.delete(key);
    });
  };

  const types = (params.get("type") ?? "").split(",").filter(Boolean);
  const countries = (params.get("country") ?? "").split(",").filter(Boolean);
  const onlyReg = params.get("reg") === "1";

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    update((sp) => (q ? sp.set("q", q) : sp.delete("q")));
  };

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="대회·도시·국가 검색"
            className="pl-9"
            aria-label="검색"
          />
        </div>
        <Button type="submit" disabled={pending}>
          검색
        </Button>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden" aria-label="필터 열기">
              <SlidersHorizontal className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh]">
            <SheetHeader>
              <SheetTitle>필터</SheetTitle>
              <SheetDescription>여러 조건을 조합해 검색하세요</SheetDescription>
            </SheetHeader>
            <div className="px-6 pb-6 space-y-6 overflow-y-auto">
              <FilterGroups
                types={types}
                countries={countries}
                onlyReg={onlyReg}
                onToggle={toggleMulti}
                onToggleReg={(v) => update((sp) => (v ? sp.set("reg", "1") : sp.delete("reg")))}
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
          onToggle={toggleMulti}
          onToggleReg={(v) => update((sp) => (v ? sp.set("reg", "1") : sp.delete("reg")))}
        />
      </div>

      {(types.length > 0 || countries.length > 0 || onlyReg) && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {countries.map((c) => (
            <Badge
              key={`c-${c}`}
              variant="accent"
              className="cursor-pointer gap-1 pl-2 pr-1"
              onClick={() => toggleMulti("country", c)}
            >
              {c}
              <X className="size-3" />
            </Badge>
          ))}
          {types.map((t) => (
            <Badge
              key={`t-${t}`}
              variant="accent"
              className="cursor-pointer gap-1 pl-2 pr-1"
              onClick={() => toggleMulti("type", t)}
            >
              {PRIMARY_TYPE_LABEL_KO[t as PrimaryType] ?? t}
              <X className="size-3" />
            </Badge>
          ))}
          {onlyReg && (
            <Badge
              variant="accent"
              className="cursor-pointer gap-1 pl-2 pr-1"
              onClick={() => update((sp) => sp.delete("reg"))}
            >
              등록 가능만
              <X className="size-3" />
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.replace(window.location.pathname, { scroll: false })}
            className="ml-auto text-xs text-fg-muted"
          >
            전체 초기화
          </Button>
        </div>
      )}
    </div>
  );
}

function FilterGroups({
  types,
  countries,
  onlyReg,
  onToggle,
  onToggleReg,
}: {
  types: string[];
  countries: string[];
  onlyReg: boolean;
  onToggle: (key: string, value: string) => void;
  onToggleReg: (v: boolean) => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-wider text-fg-subtle mb-2">
          종목
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {PRIMARY_TYPES.map((t) => {
            const active = types.includes(t);
            return (
              <button
                type="button"
                key={t}
                onClick={() => onToggle("type", t)}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  active
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border text-fg-muted hover:border-accent/40 hover:text-fg",
                )}
              >
                {PRIMARY_TYPE_LABEL_KO[t]}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-wider text-fg-subtle mb-2">
          국가
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {TOP_COUNTRIES.map((c) => {
            const active = countries.includes(c.code);
            return (
              <button
                type="button"
                key={c.code}
                onClick={() => onToggle("country", c.code)}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  active
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border text-fg-muted hover:border-accent/40 hover:text-fg",
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-wider text-fg-subtle mb-2">
          기타
        </legend>
        <label className="flex items-center gap-2 text-sm text-fg-muted cursor-pointer">
          <input
            type="checkbox"
            checked={onlyReg}
            onChange={(e) => onToggleReg(e.target.checked)}
            className="size-4 rounded border-border-strong text-accent focus:ring-accent"
          />
          등록 가능한 대회만
        </label>
      </fieldset>
    </div>
  );
}
