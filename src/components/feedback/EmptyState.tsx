import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-surface/40 p-10 text-center",
        className,
      )}
    >
      {icon && <div className="text-fg-subtle">{icon}</div>}
      <h3 className="font-display text-lg text-fg">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-fg-muted leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
