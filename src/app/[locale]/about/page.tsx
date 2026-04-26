import { Wordmark } from "@/components/brand/Wordmark";
import { getTranslations, setRequestLocale } from "next-intl/server";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  return (
    <div className="container-prose py-14 sm:py-20">
      <Wordmark size={32} />
      <h1 className="mt-6 font-display text-4xl tracking-tight">{t("title")}</h1>
      <div className="prose prose-invert mt-6 space-y-4 text-fg-muted leading-relaxed">
        <p>{t("p1")}</p>
        <p>{t("p2")}</p>
        <h2 className="font-display text-2xl text-fg mt-10">{t("sources")}</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <a
              className="text-accent hover:underline"
              href="https://worldsmarathons.com"
              target="_blank"
              rel="noreferrer noopener"
            >
              worldsmarathons.com
            </a>{" "}
            — {t("source_wm")}
          </li>
          <li>
            <a
              className="text-accent hover:underline"
              href="https://utmb.world"
              target="_blank"
              rel="noreferrer noopener"
            >
              UTMB World Series
            </a>{" "}
            — {t("source_utmb")}
          </li>
          <li>
            <a
              className="text-accent hover:underline"
              href="https://itra.run"
              target="_blank"
              rel="noreferrer noopener"
            >
              ITRA
            </a>{" "}
            — {t("source_itra")}
          </li>
        </ul>
        <h2 className="font-display text-2xl text-fg mt-10">{t("tech_title")}</h2>
        <p>
          {t("tech_p").replace("gomdolkim/RunningApi", "")}
          <a
            className="text-accent hover:underline"
            href="https://github.com/gomdolkim/RunningApi"
            target="_blank"
            rel="noreferrer noopener"
          >
            gomdolkim/RunningApi
          </a>
          .
        </p>
      </div>
    </div>
  );
}
