"use client";

import { Button } from "@/components/ui/button";
import { Check, Copy, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const t = useTranslations("race_detail");
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  async function nativeShare() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* user cancel */
      }
    } else {
      copyLink();
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" onClick={nativeShare}>
        <Share2 className="size-3.5" />
        {t("share")}
      </Button>
      <Button size="sm" variant="outline" onClick={copyLink}>
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        {copied ? t("share_copied") : t("share_link")}
      </Button>
      <Button asChild size="sm" variant="outline">
        <a
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          X
        </a>
      </Button>
      <Button asChild size="sm" variant="outline">
        <a
          href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
      </Button>
    </div>
  );
}
