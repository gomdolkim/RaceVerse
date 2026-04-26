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
    <div className="relative h-[calc(100dvh-4rem-4rem)] md:h-[calc(100dvh-4rem)] w-full">
      <header className="absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full border border-border bg-surface/80 px-4 py-1.5 text-xs text-fg-muted backdrop-blur-md">
        {t("subtitle")}
      </header>
      <MapClient />
    </div>
  );
}
