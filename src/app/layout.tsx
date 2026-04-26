import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "../styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz", "SOFT"],
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "RaceVerse — 전 세계 마라톤·트레일 캘린더",
    template: "%s | RaceVerse",
  },
  description:
    "전 세계 5,500+ 마라톤·트레일·울트라 대회를 한 곳에서. 국가, 거리, 일정으로 탐색하고 등록하세요.",
  keywords: [
    "마라톤",
    "트레일",
    "울트라",
    "대회",
    "러닝",
    "running",
    "race",
    "marathon",
    "trail",
    "ultra",
  ],
  authors: [{ name: "GOMI Kim", url: "https://github.com/gomdolkim" }],
  openGraph: {
    type: "website",
    siteName: "RaceVerse",
    locale: "ko_KR",
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#16161d" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable} ${jetbrains.variable}`}
    >
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
