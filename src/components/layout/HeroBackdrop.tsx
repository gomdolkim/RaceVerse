import { cn } from "@/lib/utils";

/**
 * Animated gradient mesh + grid + noise — premium hero backdrop.
 * Use as an absolutely-positioned sibling within a relative parent.
 */
export function HeroBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
    >
      <div className="absolute inset-0 bg-gradient-mesh opacity-90" />
      <div
        className="absolute inset-0 opacity-[0.06] dark:opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(to right, oklch(var(--fg) / 0.6) 1px, transparent 1px), linear-gradient(to bottom, oklch(var(--fg) / 0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      <div className="absolute inset-x-0 -top-40 h-[420px] bg-gradient-to-b from-bg/0 via-bg/0 to-bg" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />
    </div>
  );
}
