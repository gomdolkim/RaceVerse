import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ locale: string; doc: string }>;
}

const VALID_DOCS = ["privacy", "terms"] as const;

export default async function LegalPage({ params }: PageProps) {
  const { locale, doc } = await params;
  setRequestLocale(locale);
  if (!(VALID_DOCS as readonly string[]).includes(doc)) notFound();
  const t = await getTranslations("legal");

  const title = doc === "privacy" ? t("privacy_title") : t("terms_title");
  const body = doc === "privacy" ? t("privacy_body") : t("terms_body");

  return (
    <div className="container-prose py-14 sm:py-20">
      <h1 className="font-display text-4xl tracking-tight">{title}</h1>
      <p className="mt-6 text-fg-muted leading-relaxed whitespace-pre-line">{body}</p>
      <p className="mt-12 text-xs text-fg-subtle tabular">
        {t("last_updated", { date: new Date().toISOString().slice(0, 10) })}
      </p>
    </div>
  );
}
