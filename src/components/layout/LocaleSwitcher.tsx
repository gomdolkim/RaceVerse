"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { type Locale, localeLabel, locales } from "@/lib/i18n/config";
import { usePathname, useRouter } from "@/lib/i18n/routing";
import { Languages } from "lucide-react";
import { useLocale } from "next-intl";

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  function cycleLocale() {
    const idx = locales.indexOf(locale);
    const next = locales[(idx + 1) % locales.length];
    router.replace(pathname, { locale: next });
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`언어: ${localeLabel[locale]}`}
          onClick={cycleLocale}
          className="gap-2 px-3 tabular"
        >
          <Languages className="size-4" />
          <span className="hidden sm:inline">{localeLabel[locale]}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{localeLabel[locale]}</TooltipContent>
    </Tooltip>
  );
}
