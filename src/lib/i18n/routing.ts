import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";
import { defaultLocale, locales } from "./config";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
  // Force Korean as the initial language for first-time visitors —
  // do not auto-detect from Accept-Language header. User can still
  // switch via the LocaleSwitcher (which sets `NEXT_LOCALE` cookie).
  localeDetection: false,
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
