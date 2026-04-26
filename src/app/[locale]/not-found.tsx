import { HeroBackdrop } from "@/components/layout/HeroBackdrop";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/routing";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("404");
  return (
    <section className="relative isolate flex min-h-[70dvh] items-center justify-center overflow-hidden noise">
      <HeroBackdrop />
      <div className="container-wide relative z-10 mx-auto max-w-xl text-center">
        <p className="font-display text-[6rem] font-semibold leading-none text-gradient-accent tabular">
          404
        </p>
        <h1 className="mt-4 font-display text-3xl tracking-tight">{t("title")}</h1>
        <p className="mt-3 text-fg-muted">{t("subtitle")}</p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/">{t("cta")}</Link>
        </Button>
      </div>
    </section>
  );
}
