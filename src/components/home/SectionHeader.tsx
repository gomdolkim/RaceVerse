import { Link } from "@/lib/i18n/routing";
import { ArrowUpRight } from "lucide-react";

export function SectionHeader({
  title,
  subtitle,
  href,
  ctaLabel,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  ctaLabel?: string;
}) {
  return (
    <header className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl tracking-tight sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-fg-muted">{subtitle}</p>}
      </div>
      {href && ctaLabel && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm text-fg-muted hover:text-accent transition-colors"
        >
          {ctaLabel}
          <ArrowUpRight className="size-4" />
        </Link>
      )}
    </header>
  );
}
