"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export function Pagination({
  offset,
  limit,
  total,
}: {
  offset: number;
  limit: number;
  total: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const page = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  function go(nextOffset: number) {
    const sp = new URLSearchParams(params);
    if (nextOffset <= 0) sp.delete("offset");
    else sp.set("offset", String(nextOffset));
    router.replace(`?${sp.toString()}`, { scroll: true });
  }

  if (total <= limit) return null;

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-between gap-3">
      <Button
        variant="outline"
        size="sm"
        disabled={offset === 0}
        onClick={() => go(Math.max(0, offset - limit))}
      >
        <ChevronLeft className="size-4" />
        이전
      </Button>
      <p className="text-sm text-fg-muted tabular">
        {page} / {totalPages}
      </p>
      <Button
        variant="outline"
        size="sm"
        disabled={offset + limit >= total}
        onClick={() => go(offset + limit)}
      >
        다음
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  );
}
