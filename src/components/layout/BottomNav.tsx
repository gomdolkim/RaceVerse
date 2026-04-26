"use client";

import { Link, usePathname } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";
import { Calendar, Globe, Home, Map, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

const ITEMS = [
  { href: "/", icon: Home, key: "home" as const },
  { href: "/races", icon: Trophy, key: "races" as const },
  { href: "/calendar", icon: Calendar, key: "calendar" as const },
  { href: "/map", icon: Map, key: "map" as const },
  { href: "/countries", icon: Globe, key: "countries" as const },
];

export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary mobile"
      className={cn(
        "fixed bottom-0 inset-x-0 z-40 md:hidden",
        "border-t border-border bg-bg/85 backdrop-blur-xl",
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium tracking-tight transition-colors",
                  "active:bg-surface-raised",
                  active ? "text-accent" : "text-fg-muted hover:text-fg",
                )}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-accent"
                  />
                )}
                <Icon className="size-5" />
                <span>{t(item.key)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
