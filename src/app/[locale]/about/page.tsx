import { Wordmark } from "@/components/brand/Wordmark";
import { setRequestLocale } from "next-intl/server";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container-prose py-14 sm:py-20">
      <Wordmark size={32} />
      <h1 className="mt-6 font-display text-4xl tracking-tight">러너의 다음 도전을 더 가깝게</h1>
      <div className="prose prose-invert mt-6 space-y-4 text-fg-muted leading-relaxed">
        <p>
          RaceVerse는 전 세계의 마라톤·트레일·울트라 대회를 한 곳에 모아 보여주는 오픈
          카탈로그입니다. 매 2시간마다 자동으로 데이터를 갱신하며, 공식 worldsmarathons, UTMB World
          Series, ITRA 같은 신뢰할 수 있는 출처에서 정보를 수집합니다.
        </p>
        <p>
          사용자는 국가, 거리, 일정, 등록 가능 여부 등으로 자유롭게 검색하고, 지도에서 위치 기반으로
          탐색하거나 캘린더에서 다가오는 대회를 미리 확인할 수 있습니다. 대회 상세 페이지에서는 등록
          링크, 거리별 정보, ITRA/UTMB 포인트, 고도 정보까지 한눈에 볼 수 있습니다.
        </p>
        <h2 className="font-display text-2xl text-fg mt-10">데이터 출처</h2>
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
            — 전 세계 5,200+ 마라톤 데이터
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
            — 고품질 트레일 다일 이벤트
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
            — 트레일 카테고리 + 포인트
          </li>
        </ul>
        <h2 className="font-display text-2xl text-fg mt-10">기술</h2>
        <p>
          Next.js 15 App Router · Supabase Postgres + PostGIS · MapLibre GL · shadcn/ui · Vercel
          Edge. Backend(크롤러)는{" "}
          <a
            className="text-accent hover:underline"
            href="https://github.com/gomdolkim/RunningApi"
            target="_blank"
            rel="noreferrer noopener"
          >
            gomdolkim/RunningApi
          </a>
          에서 운영됩니다.
        </p>
      </div>
    </div>
  );
}
