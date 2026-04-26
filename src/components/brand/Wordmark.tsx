import { cn } from "@/lib/utils";
import Link from "next/link";
import { Logo } from "./Logo";

export function Wordmark({
  href = "/",
  className,
  size = 26,
}: {
  href?: string;
  className?: string;
  size?: number;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2 rounded-md focus-visible:outline-none",
        className,
      )}
      aria-label="RaceVerse"
    >
      <Logo
        size={size}
        className="transition-transform duration-quick ease-out-expo group-hover:rotate-[8deg]"
      />
      <span className="font-display text-[1.35rem] font-semibold tracking-tight text-fg">
        Race<span className="text-gradient-accent">Verse</span>
      </span>
    </Link>
  );
}
