import { HeroBackdrop } from "@/components/layout/HeroBackdrop";
import { FadeIn } from "@/components/motion/FadeIn";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/routing";
import { ArrowRight, Map } from "lucide-react";
import { useTranslations } from "next-intl";

export function Hero() {
  const t = useTranslations("home");
  return (
    <section className="relative isolate overflow-hidden noise">
      <HeroBackdrop />
      <div className="container-wide relative z-10 px-4 pb-20 pt-20 sm:pt-28 sm:pb-28">
        <FadeIn>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-fg-muted backdrop-blur">
            <span className="size-1.5 rounded-full bg-accent animate-pulse" />
            {t("hero_eyebrow")}
          </span>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h1 className="mt-5 max-w-4xl font-display text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            {t("hero_title")}
            <span className="block text-gradient-accent">{t("hero_title_accent")}</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="mt-6 max-w-2xl text-pretty text-base text-fg-muted leading-relaxed sm:text-lg">
            {t("hero_subtitle")}
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button asChild size="xl" className="group">
              <Link href="/races">
                {t("hero_cta_primary")}
                <ArrowRight className="size-4 transition-transform duration-quick group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="glass">
              <Link href="/map">
                <Map className="size-4" />
                {t("hero_cta_secondary")}
              </Link>
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
