import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors",
  {
    variants: {
      variant: {
        default: "bg-surface-raised text-fg ring-border",
        accent: "bg-accent/15 text-accent ring-accent/30",
        outline: "bg-transparent text-fg-muted ring-border-strong",
        success: "bg-success/15 text-success ring-success/30",
        warning: "bg-warning/15 text-warning ring-warning/30",
        danger: "bg-danger/15 text-danger ring-danger/30",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
