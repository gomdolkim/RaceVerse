import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number | null | undefined, locale = "ko-KR"): string {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat(locale).format(n);
}

export function formatDistance(km: number | null | undefined, locale = "ko-KR"): string {
  if (km === null || km === undefined) return "—";
  if (km >= 1) {
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(km)} km`;
  }
  return `${Math.round(km * 1000)} m`;
}

export function formatPrice(
  amount: number | null | undefined,
  currency: string | null | undefined,
  locale = "ko-KR",
): string {
  if (amount === null || amount === undefined) return "—";
  if (!currency) return new Intl.NumberFormat(locale).format(amount);
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9가-힣ぁ-んァ-ヶ一-龠]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
