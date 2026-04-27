"use client";

import { readSavedFromDocument, toggleSaved, writeSavedToDocument } from "@/lib/prefs/saved";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface Props {
  raceId: string;
  /**
   * `sm` is the corner-of-card variant, `default` is the inline detail page CTA.
   * `pill` is a rounded pill with text — used in race hero.
   */
  variant?: "sm" | "default" | "pill";
  /** When set, prevents the parent <Link> from navigating on click. */
  stopPropagation?: boolean;
  className?: string;
}

/**
 * Custom event so other SaveButtons / the header badge update without a
 * full page refresh when one button toggles the cookie.
 */
const EVENT = "raceverse:saved-changed";

export function dispatchSavedChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function useSavedRaces(): { ids: string[]; ready: boolean } {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIds(readSavedFromDocument());
    setReady(true);
    const handler = () => setIds(readSavedFromDocument());
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return { ids, ready };
}

export function SaveButton({ raceId, variant = "sm", stopPropagation = false, className }: Props) {
  const t = useTranslations("saved");
  const { ids, ready } = useSavedRaces();
  const isSaved = ids.includes(raceId);

  // Suppress hydration mismatch — render a non-saved skeleton until mounted.
  const effectiveSaved = ready && isSaved;

  const onClick = (e: React.MouseEvent) => {
    if (stopPropagation) {
      e.preventDefault();
      e.stopPropagation();
    }
    const next = toggleSaved(readSavedFromDocument(), raceId);
    writeSavedToDocument(next);
    dispatchSavedChanged();
  };

  const label = effectiveSaved ? t("remove") : t("save");

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={effectiveSaved}
        aria-label={label}
        title={label}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
          effectiveSaved
            ? "border-accent bg-accent/15 text-accent"
            : "border-border bg-surface/40 text-fg-muted hover:border-accent/40 hover:bg-surface-overlay hover:text-fg",
          className,
        )}
      >
        <Heart className={cn("size-4 transition-all", effectiveSaved && "fill-current")} />
        <span>{effectiveSaved ? t("saved") : t("save_short")}</span>
      </button>
    );
  }

  if (variant === "default") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={effectiveSaved}
        aria-label={label}
        title={label}
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors",
          effectiveSaved
            ? "border-accent bg-accent/15 text-accent"
            : "border-border bg-surface text-fg-muted hover:border-accent/40 hover:text-fg",
          className,
        )}
      >
        <Heart className={cn("size-5", effectiveSaved && "fill-current")} />
      </button>
    );
  }

  // sm — inline button intended to sit next to other badges in a row.
  // Slightly oversized hit target (~32px) but visually compact.
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={effectiveSaved}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-full transition-colors",
        effectiveSaved
          ? "text-accent hover:bg-accent/10"
          : "text-fg-subtle hover:bg-surface-overlay hover:text-fg",
        className,
      )}
    >
      <Heart className={cn("size-4 transition-all", effectiveSaved && "fill-current")} />
    </button>
  );
}
