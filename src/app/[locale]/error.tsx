"use client";

import { HeroBackdrop } from "@/components/layout/HeroBackdrop";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[RaceVerse]", error);
  }, [error]);

  return (
    <section className="relative isolate flex min-h-[70dvh] items-center justify-center overflow-hidden noise">
      <HeroBackdrop />
      <div className="container-wide relative z-10 mx-auto max-w-xl text-center">
        <p className="font-display text-[5rem] font-semibold leading-none text-gradient-accent">
          잠시
        </p>
        <h1 className="mt-3 font-display text-3xl tracking-tight">길을 잃었어요</h1>
        <p className="mt-3 text-fg-muted">곧 복구됩니다. 새로고침을 시도해 보세요.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button onClick={reset} size="lg">
            다시 시도
          </Button>
        </div>
        {error.digest && (
          <p className="mt-6 font-mono text-xs text-fg-subtle">ref: {error.digest}</p>
        )}
      </div>
    </section>
  );
}
