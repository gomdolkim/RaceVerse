"use client";

import { useSavedRaces } from "@/components/race/SaveButton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link, usePathname } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";

export function SavedNavLink() {
  const t = useTranslations("saved");
  const pathname = usePathname();
  const { ids, ready } = useSavedRaces();
  const count = ids.length;
  const active = pathname === "/saved" || pathname.startsWith("/saved");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href="/saved"
          aria-label={t("tooltip")}
          className={cn(
            "relative inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors",
            active ? "text-accent" : "text-fg-muted hover:text-fg",
          )}
        >
          <Heart
            className={cn(
              "size-4 transition-all",
              ready && count > 0 && "fill-current text-accent",
            )}
          />
          {ready && count > 0 && (
            <span
              aria-hidden
              className="absolute -right-0.5 -top-0.5 grid min-w-[16px] h-4 place-items-center rounded-full bg-accent px-1 text-[9px] font-semibold tabular text-accent-fg"
            >
              {count > 99 ? "99+" : count}
            </span>
          )}
        </Link>
      </TooltipTrigger>
      <TooltipContent>{t("tooltip")}</TooltipContent>
    </Tooltip>
  );
}
