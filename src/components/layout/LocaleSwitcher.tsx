"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { type Locale, localeLabel, locales } from "@/lib/i18n/config";
import { Link, usePathname } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";
import { Check, Languages } from "lucide-react";
import { useLocale } from "next-intl";
import { useState } from "react";

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Language: ${localeLabel[locale]}`}
          className="gap-2 px-3 tabular"
        >
          <Languages className="size-4" />
          <span className="hidden sm:inline">{localeLabel[locale]}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-44 p-1">
        {locales.map((l) => (
          <Link
            key={l}
            href={pathname}
            locale={l}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              locale === l ? "bg-accent/15 text-accent" : "text-fg hover:bg-surface-raised",
            )}
          >
            <span>{localeLabel[l]}</span>
            {locale === l && <Check className="size-4" />}
          </Link>
        ))}
      </PopoverContent>
    </Popover>
  );
}
