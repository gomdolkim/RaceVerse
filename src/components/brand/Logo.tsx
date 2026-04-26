import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
}

/** RaceVerse mark — abstracted globe + finish-line ribbon */
export function Logo({ className, size = 28 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="rv-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(var(--accent))" />
          <stop offset="100%" stopColor="oklch(var(--mesh-2))" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14" stroke="url(#rv-grad)" strokeWidth="2.4" />
      <path
        d="M3 16 Q 9 11, 16 16 T 29 16"
        stroke="url(#rv-grad)"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="22.5" cy="13.5" r="2.2" fill="url(#rv-grad)" />
    </svg>
  );
}
