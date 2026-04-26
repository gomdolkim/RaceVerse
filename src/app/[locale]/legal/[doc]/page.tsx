import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

const DOCS = {
  privacy: {
    title: "개인정보처리방침",
    body: `RaceVerse는 사용자의 계정 정보를 수집하지 않습니다. 익명 분석(Vercel Analytics)을 위해 IP 주소와 브라우저 정보가 일시적으로 수집되며, 개인 식별이 불가능한 형태로 저장됩니다. 자세한 내용은 Vercel의 정책을 참고하세요.`,
  },
  terms: {
    title: "이용약관",
    body: `RaceVerse가 표시하는 대회 정보는 외부 공개 데이터를 정제·집계한 것으로, 정확성을 보장하지 않습니다. 등록 전에는 반드시 공식 사이트에서 최신 정보를 확인하시기 바랍니다. 데이터 사용은 비상업적 목적에 한합니다.`,
  },
} as const;

interface PageProps {
  params: Promise<{ locale: string; doc: string }>;
}

export default async function LegalPage({ params }: PageProps) {
  const { locale, doc } = await params;
  setRequestLocale(locale);
  if (!(doc in DOCS)) notFound();
  const d = DOCS[doc as keyof typeof DOCS];

  return (
    <div className="container-prose py-14 sm:py-20">
      <h1 className="font-display text-4xl tracking-tight">{d.title}</h1>
      <p className="mt-6 text-fg-muted leading-relaxed whitespace-pre-line">{d.body}</p>
      <p className="mt-12 text-xs text-fg-subtle tabular">
        최종 업데이트: {new Date().toISOString().slice(0, 10)}
      </p>
    </div>
  );
}
