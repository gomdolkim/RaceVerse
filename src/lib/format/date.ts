import { format, formatDistanceToNowStrict, parseISO } from "date-fns";
import { enUS, ko } from "date-fns/locale";

type SupportedLocale = "ko" | "en";

function getLocale(locale: SupportedLocale | string | undefined) {
  return locale === "en" ? enUS : ko;
}

const PATTERNS: Record<SupportedLocale, { full: string; short: string }> = {
  ko: { full: "yyyy년 M월 d일", short: "yyyy.MM.dd" },
  en: { full: "MMM d, yyyy", short: "yyyy.MM.dd" },
};

function patternFor(locale: SupportedLocale | string | undefined, kind: "full" | "short") {
  const l = (locale === "en" ? "en" : "ko") as SupportedLocale;
  return PATTERNS[l][kind];
}

export function formatEventDate(
  iso: string | null | undefined,
  pattern?: string,
  locale: SupportedLocale | string = "ko",
): string {
  if (!iso) return locale === "en" ? "TBA" : "일정 미정";
  try {
    return format(parseISO(iso), pattern ?? patternFor(locale, "full"), {
      locale: getLocale(locale),
    });
  } catch {
    return iso;
  }
}

export function formatDateRange(
  startIso: string | null | undefined,
  endIso: string | null | undefined,
  locale: SupportedLocale | string = "ko",
): string {
  if (!startIso) return locale === "en" ? "TBA" : "일정 미정";
  if (!endIso || endIso === startIso) return formatEventDate(startIso, undefined, locale);
  const start = parseISO(startIso);
  const end = parseISO(endIso);
  const lc = getLocale(locale);
  if (start.getFullYear() === end.getFullYear()) {
    if (start.getMonth() === end.getMonth()) {
      if (locale === "en") {
        return `${format(start, "MMM d", { locale: lc })}–${format(end, "d, yyyy", {
          locale: lc,
        })}`;
      }
      return `${format(start, "yyyy년 M월 d일", { locale: lc })} – ${format(end, "d일", {
        locale: lc,
      })}`;
    }
    if (locale === "en") {
      return `${format(start, "MMM d", { locale: lc })} – ${format(end, "MMM d, yyyy", {
        locale: lc,
      })}`;
    }
    return `${format(start, "M월 d일", { locale: lc })} – ${format(end, "M월 d일", {
      locale: lc,
    })}, ${format(start, "yyyy")}`;
  }
  return `${formatEventDate(startIso, undefined, locale)} – ${formatEventDate(endIso, undefined, locale)}`;
}

export function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const target = parseISO(iso).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

export function relativeFromNow(
  iso: string | null | undefined,
  locale: SupportedLocale | string = "ko",
): string {
  if (!iso) return "";
  try {
    return formatDistanceToNowStrict(parseISO(iso), {
      locale: getLocale(locale),
      addSuffix: true,
    });
  } catch {
    return "";
  }
}

export function dCountdown(iso: string | null | undefined): string {
  const d = daysUntil(iso);
  if (d === null) return "";
  if (d === 0) return "D-Day";
  if (d > 0) return `D-${d}`;
  return `D+${Math.abs(d)}`;
}

export function shortDate(
  iso: string | null | undefined,
  locale: SupportedLocale | string = "ko",
): string {
  return formatEventDate(iso, patternFor(locale, "short"), locale);
}
