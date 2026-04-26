"use client";

import { CountryFlag } from "@/components/race/CountryFlag";
import { Button } from "@/components/ui/button";
import { PRIMARY_TYPE_BADGE } from "@/lib/format/race";
import { Link } from "@/lib/i18n/routing";
import type { RaceWithNextEdition } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function CalendarGrid({ races }: { races: RaceWithNextEdition[] }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const monthRaces = useMemo(() => {
    const map = new Map<string, RaceWithNextEdition[]>();
    const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    for (const r of races) {
      if (!r.event_date) continue;
      const d = new Date(r.event_date);
      if (d < start || d > end) continue;
      const key = r.event_date;
      const list = map.get(key) ?? [];
      list.push(r);
      map.set(key, list);
    }
    return map;
  }, [cursor, races]);

  const days = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    const cells: { date: Date; inMonth: boolean }[] = [];
    const cur = new Date(start);
    while (cur <= last || cur.getDay() !== 0) {
      cells.push({
        date: new Date(cur),
        inMonth: cur.getMonth() === cursor.getMonth(),
      });
      cur.setDate(cur.getDate() + 1);
      if (cells.length > 42) break;
    }
    return cells;
  }, [cursor]);

  function shift(delta: number) {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));
  }

  return (
    <motion.div
      key={cursor.toISOString()}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <header className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl tabular">
          {cursor.getFullYear()}년 {cursor.getMonth() + 1}월
        </h2>
        <div className="flex gap-1">
          <Button size="icon" variant="outline" onClick={() => shift(-1)} aria-label="이전 달">
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCursor(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
          >
            오늘
          </Button>
          <Button size="icon" variant="outline" onClick={() => shift(1)} aria-label="다음 달">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </header>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-border bg-border">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="bg-surface px-3 py-2 text-xs font-medium text-fg-muted uppercase tracking-wider tabular"
          >
            {d}
          </div>
        ))}
        {days.map((cell, i) => {
          const isoKey = isoDate(cell.date);
          const dayRaces = monthRaces.get(isoKey) ?? [];
          return (
            <div
              key={i}
              className={cn(
                "min-h-[80px] sm:min-h-[120px] p-2 transition-colors",
                cell.inMonth ? "bg-surface-raised" : "bg-surface text-fg-subtle/50",
                isToday(cell.date) && "ring-1 ring-inset ring-accent",
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-xs tabular",
                    isToday(cell.date) ? "text-accent font-semibold" : "text-fg-muted",
                  )}
                >
                  {cell.date.getDate()}
                </span>
                {dayRaces.length > 0 && (
                  <span className="text-[10px] text-accent tabular">+{dayRaces.length}</span>
                )}
              </div>
              <ul className="mt-1.5 space-y-1">
                {dayRaces.slice(0, 3).map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/races/${r.slug}`}
                      className={cn(
                        "block truncate rounded px-1.5 py-0.5 text-[11px] ring-1 ring-inset",
                        PRIMARY_TYPE_BADGE[r.primary_type],
                      )}
                    >
                      <CountryFlag code={r.country_code} size={11} />{" "}
                      <span className="ml-0.5">{r.canonical_name}</span>
                    </Link>
                  </li>
                ))}
                {dayRaces.length > 3 && (
                  <li className="text-[10px] text-fg-subtle pl-1.5">+{dayRaces.length - 3}개 더</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isToday(d: Date): boolean {
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}
