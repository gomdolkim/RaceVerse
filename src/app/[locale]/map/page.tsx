import { getTranslations, setRequestLocale } from "next-intl/server";
import MapClient from "./MapClient";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function MapPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("map");

  return (
    // Map fills the remaining viewport. On mobile we subtract the top nav
    // (4rem) + bottom nav (4rem) + iOS home-indicator safe area so map
    // controls never sit underneath the bottom nav. Desktop has only the
    // top nav to subtract.
    <div className="relative w-full h-[var(--map-h-mobile)] md:h-[var(--map-h-desktop)] [--map-h-mobile:calc(100dvh-4rem-4rem-env(safe-area-inset-bottom,0px))] [--map-h-desktop:calc(100dvh-4rem)]">
      <header className="absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full border border-border bg-surface/80 px-4 py-1.5 text-xs text-fg-muted backdrop-blur-md">
        {t("subtitle")}
      </header>
      <MapClient />
    </div>
  );
}
