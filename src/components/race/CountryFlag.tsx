import { flagEmoji } from "@/lib/format/country";
import { cn } from "@/lib/utils";

export function CountryFlag({
  code,
  size = 18,
  className,
}: {
  code: string | null | undefined;
  size?: number;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label={code ?? "국가 미상"}
      className={cn("inline-block leading-none", className)}
      style={{ fontSize: size }}
    >
      {flagEmoji(code)}
    </span>
  );
}
