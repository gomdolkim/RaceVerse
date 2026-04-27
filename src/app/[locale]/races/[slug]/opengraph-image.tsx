import { countryName, flagEmoji } from "@/lib/format/country";
import { formatEventDate } from "@/lib/format/date";
import { getRaceBySlug } from "@/lib/queries/races";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TYPE_LABEL: Record<string, { ko: string; en: string }> = {
  road_marathon: { ko: "로드 마라톤", en: "Road marathon" },
  road_other: { ko: "로드", en: "Road" },
  trail: { ko: "트레일", en: "Trail" },
  ultra: { ko: "울트라", en: "Ultra" },
  mixed: { ko: "복합", en: "Mixed" },
  virtual: { ko: "버추얼", en: "Virtual" },
  unknown: { ko: "분류 미정", en: "Uncategorized" },
};

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function Image({ params }: PageProps) {
  // Next.js 15 — params is a Promise and must be awaited.
  const { locale, slug } = await params;
  const race = await getRaceBySlug(slug).catch(() => null);

  const lang: "ko" | "en" = locale === "en" ? "en" : "ko";
  const fallbackSubtitle =
    lang === "en" ? "Marathons & trails worldwide" : "전 세계 마라톤 · 트레일";
  const title = race?.canonical_name ?? "RaceVerse";
  const subtitle = race
    ? `${flagEmoji(race.country_code)} ${countryName(race.country_code, lang, race.country_name)}${
        race.city ? ` · ${race.city}` : ""
      }`
    : fallbackSubtitle;
  const date = race?.event_date ? formatEventDate(race.event_date, undefined, lang) : "";
  const type = race ? (TYPE_LABEL[race.primary_type]?.[lang] ?? "") : "";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #16161d 0%, #2a1a25 50%, #3a1a18 100%)",
        color: "#fafafa",
        padding: "72px 80px",
        fontFamily: "system-ui, sans-serif",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 26 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            background: "linear-gradient(135deg, #FF6B5B, #E85DA8)",
          }}
        />
        <span style={{ fontWeight: 600 }}>RaceVerse</span>
      </div>

      <div style={{ display: "flex", flex: 1, alignItems: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 980 }}>
          <span style={{ fontSize: 26, opacity: 0.78 }}>{subtitle}</span>
          <span
            style={{
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </span>
          <div style={{ display: "flex", gap: 18, fontSize: 24, opacity: 0.85 }}>
            {type && (
              <span
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  background: "rgba(255,107,91,0.18)",
                  color: "#FF9A8E",
                }}
              >
                {type}
              </span>
            )}
            {date && <span>{date}</span>}
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: -120,
          top: -120,
          width: 480,
          height: 480,
          borderRadius: 999,
          background: "radial-gradient(circle at center, rgba(255,107,91,0.45), transparent 70%)",
          filter: "blur(40px)",
        }}
      />
    </div>,
    { ...size },
  );
}
