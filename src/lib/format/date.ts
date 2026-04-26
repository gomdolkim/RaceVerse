import { format, formatDistanceToNowStrict, parseISO } from "date-fns";
import { ko } from "date-fns/locale";

export function formatEventDate(
  iso: string | null | undefined,
  pattern = "yyyy년 M월 d일",
): string {
  if (!iso) return "일정 미정";
  try {
    return format(parseISO(iso), pattern, { locale: ko });
  } catch {
    return iso;
  }
}

export function formatDateRange(
  startIso: string | null | undefined,
  endIso: string | null | undefined,
): string {
  if (!startIso) return "일정 미정";
  if (!endIso || endIso === startIso) return formatEventDate(startIso);
  const start = parseISO(startIso);
  const end = parseISO(endIso);
  if (start.getFullYear() === end.getFullYear()) {
    if (start.getMonth() === end.getMonth()) {
      return `${format(start, "yyyy년 M월 d일", { locale: ko })} – ${format(end, "d일", { locale: ko })}`;
    }
    return `${format(start, "M월 d일", { locale: ko })} – ${format(end, "M월 d일", { locale: ko })}, ${format(start, "yyyy")}`;
  }
  return `${formatEventDate(startIso)} – ${formatEventDate(endIso)}`;
}

export function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const target = parseISO(iso).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

export function relativeFromNow(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return formatDistanceToNowStrict(parseISO(iso), { locale: ko, addSuffix: true });
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
