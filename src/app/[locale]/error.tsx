"use client";

import { HeroBackdrop } from "@/components/layout/HeroBackdrop";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");
  useEffect(() => {
    console.error("[RaceVerse]", error);
  }, [error]);

  return (
    <section className="relative isolate flex min-h-[70dvh] items-center justify-center overflow-hidden noise">
      <HeroBackdrop />
      <div className="container-wide relative z-10 mx-auto max-w-xl text-center">
        <h1 className="font-display text-3xl tracking-tight text-gradient-accent">
          {t("error_title")}
        </h1>
        <p className="mt-3 text-fg-muted">{t("error_subtitle")}</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button onClick={reset} size="lg">
            {t("error_retry")}
          </Button>
        </div>
        {error.digest && (
          <p className="mt-6 font-mono text-xs text-fg-subtle">ref: {error.digest}</p>
        )}
      </div>
    </section>
  );
}
