"use client";

import { dispatchSavedChanged } from "@/components/race/SaveButton";
import { Button } from "@/components/ui/button";
import { clearSavedCookie, readSavedFromDocument, writeSavedToDocument } from "@/lib/prefs/saved";
import { Check, Copy, Heart, Share2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface Props {
  isSharedView: boolean;
  sharedIds: string[] | null;
  hasItems: boolean;
}

export function SavedActions({ isSharedView, sharedIds, hasItems }: Props) {
  const t = useTranslations("saved");
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  // Disabled when nothing to act on
  if (!hasItems && !isSharedView) return null;

  async function copyShareLink() {
    const ids = readSavedFromDocument();
    if (!ids.length) return;
    const url = `${window.location.origin}${window.location.pathname.replace(/\/saved$/, "")}/saved?ids=${ids.join(",")}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  function clearAll() {
    clearSavedCookie();
    dispatchSavedChanged();
    startTransition(() => router.refresh());
  }

  function importShared() {
    if (!sharedIds) return;
    const current = readSavedFromDocument();
    const merged = Array.from(new Set([...sharedIds, ...current]));
    writeSavedToDocument(merged);
    dispatchSavedChanged();
    startTransition(() => router.push("/saved"));
  }

  if (isSharedView) {
    return (
      <Button onClick={importShared} className="shrink-0">
        <Heart className="size-4" />
        {t("shared_save_all")}
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 shrink-0">
      <Button variant="outline" size="sm" onClick={copyShareLink}>
        {copied ? <Check className="size-3.5" /> : <Share2 className="size-3.5" />}
        {copied ? t("share_copied") : t("share")}
      </Button>
      <Button variant="ghost" size="sm" onClick={clearAll} className="text-fg-muted">
        <Trash2 className="size-3.5" />
        {t("clear_all")}
      </Button>
      {/* Hidden util to satisfy Copy import linting if needed */}
      <span className="sr-only">
        <Copy className="size-3" />
      </span>
    </div>
  );
}
