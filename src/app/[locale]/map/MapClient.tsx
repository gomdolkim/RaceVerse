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
import { countryName } from "@/lib/format/country";
import { formatEventDate } from "@/lib/format/date";
import { ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";

const RaceMap = dynamic(() => import("@/components/map/RaceMap").then((m) => m.RaceMap), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center">
      <span className="rounded-full bg-surface-raised px-3 py-1 text-xs text-fg-muted">
        Loading…
      </span>
    </div>
  ),
});

export default function MapClient() {
  const [selected, setSelected] = useState<MapRace | null>(null);
  const locale = useLocale();
  const t = useTranslations("map");

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
              {selected && countryName(selected.country_code, locale)}
              {selected?.city && ` · ${selected.city}`}
              {selected?.event_date &&
                ` · ${formatEventDate(selected.event_date, undefined, locale)}`}
            </SheetDescription>
          </SheetHeader>
          {selected && (
            <div className="px-6 pb-6">
              <Button asChild>
                <Link href={`/races/${selected.slug}`}>
                  {t("view_details")}
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
