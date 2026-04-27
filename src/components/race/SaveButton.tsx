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

  // sm — corner of card. Big enough to tap on mobile (~36px square).
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={effectiveSaved}
      aria-label={label}
      title={label}
      className={cn(
        "absolute right-2 top-2 z-10 inline-flex size-9 items-center justify-center rounded-full transition-all",
        "bg-surface/80 backdrop-blur-md ring-1 ring-inset",
        effectiveSaved
          ? "ring-accent/40 text-accent"
          : "ring-border text-fg-muted opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
        // Always show on mobile so users find it without hover.
        "max-md:opacity-100",
        className,
      )}
    >
      <Heart className={cn("size-4 transition-all", effectiveSaved && "fill-current")} />
    </button>
  );
}
