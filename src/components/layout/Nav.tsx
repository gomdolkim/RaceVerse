"use client";

import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Link, usePathname } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";
import { Menu, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";

const NAV_ITEMS = [
  { href: "/races", label: "races" },
  { href: "/calendar", label: "calendar" },
  { href: "/map", label: "map" },
  { href: "/countries", label: "countries" },
  { href: "/trail", label: "trail" },
  { href: "/insights", label: "insights" },
] as const;

export function Nav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-[background,backdrop-filter,border] duration-quick",
        scrolled
          ? "border-b border-border bg-bg/75 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-fg"
      >
        본문으로 건너뛰기
      </a>
      <div className="container-wide flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Wordmark />
          <nav aria-label="Primary" className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative rounded-md px-3 py-1.5 text-sm transition-colors duration-quick",
                    active ? "text-fg" : "text-fg-muted hover:text-fg",
                  )}
                >
                  {t(item.label)}
                  {active && (
                    <span className="absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-1">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden md:inline-flex gap-2 text-fg-muted"
            aria-label={t("open_command")}
          >
            <Link href="/races">
              <Search className="size-4" />
              <span className="hidden md:inline">{t("search")}</span>
              <kbd className="ml-1 hidden lg:inline-flex h-5 items-center rounded border border-border bg-surface-raised px-1.5 font-mono text-[10px] text-fg-subtle">
                ⌘K
              </kbd>
            </Link>
          </Button>
          <LocaleSwitcher />
          <ThemeSwitcher />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="메뉴 열기">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80vw] max-w-sm p-0">
              <SheetHeader>
                <SheetTitle>
                  <Wordmark size={22} />
                </SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobile" className="flex flex-col gap-1 p-4 pt-0">
                {NAV_ITEMS.map((item) => {
                  const active = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "rounded-lg px-3 py-3 text-base transition-colors",
                        active
                          ? "bg-accent/15 text-accent"
                          : "text-fg-muted hover:bg-surface-raised hover:text-fg",
                      )}
                    >
                      {t(item.label)}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
