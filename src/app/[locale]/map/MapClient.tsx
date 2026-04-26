"use client";

import type { MapRace } from "@/components/map/RaceMap";
import { CountryFlag } from "@/components/race/CountryFlag";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { countryNameKo } from "@/lib/format/country";
import { formatEventDate } from "@/lib/format/date";
import { ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";

// MapLibre is browser-only — SSR off, client-only render.
const RaceMap = dynamic(() => import("@/components/map/RaceMap").then((m) => m.RaceMap), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center">
      <span className="rounded-full bg-surface-raised px-3 py-1 text-xs text-fg-muted">
        지도 로딩 중...
      </span>
    </div>
  ),
});

export default function MapClient() {
  const [selected, setSelected] = useState<MapRace | null>(null);

  return (
    <>
      <RaceMap onSelect={setSelected} />
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {selected && <CountryFlag code={selected.country_code} size={20} />}
              {selected?.name}
            </SheetTitle>
            <SheetDescription className="tabular">
              {selected && countryNameKo(selected.country_code)}
              {selected?.city && ` · ${selected.city}`}
              {selected?.event_date && ` · ${formatEventDate(selected.event_date)}`}
            </SheetDescription>
          </SheetHeader>
          {selected && (
            <div className="px-6 pb-6">
              <Button asChild>
                <Link href={`/races/${selected.slug}`}>
                  자세히 보기
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
