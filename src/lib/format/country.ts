// ISO 3166-1 alpha-2 → flag emoji + localized country name lookups.

export function flagEmoji(code: string | null | undefined): string {
  if (!code || code.length !== 2) return "🏳️";
  const A = 0x1f1e6;
  const a = "A".charCodeAt(0);
  const upper = code.toUpperCase();
  const cp1 = A + (upper.charCodeAt(0) - a);
  const cp2 = A + (upper.charCodeAt(1) - a);
  return String.fromCodePoint(cp1, cp2);
}

const KO_NAMES: Record<string, string> = {
  KR: "대한민국",
  US: "미국",
  GB: "영국",
  JP: "일본",
  CN: "중국",
  TW: "대만",
  HK: "홍콩",
  SG: "싱가포르",
  TH: "태국",
  VN: "베트남",
  IN: "인도",
  ID: "인도네시아",
  MY: "말레이시아",
  PH: "필리핀",
  AU: "호주",
  NZ: "뉴질랜드",
  CA: "캐나다",
  MX: "멕시코",
  BR: "브라질",
  AR: "아르헨티나",
  CL: "칠레",
  PE: "페루",
  CO: "콜롬비아",
  FR: "프랑스",
  DE: "독일",
  IT: "이탈리아",
  ES: "스페인",
  PT: "포르투갈",
  CH: "스위스",
  AT: "오스트리아",
  NL: "네덜란드",
  BE: "벨기에",
  IE: "아일랜드",
  SE: "스웨덴",
  NO: "노르웨이",
  FI: "핀란드",
  DK: "덴마크",
  IS: "아이슬란드",
  PL: "폴란드",
  CZ: "체코",
  HU: "헝가리",
  GR: "그리스",
  TR: "튀르키예",
  RU: "러시아",
  UA: "우크라이나",
  ZA: "남아프리카공화국",
  EG: "이집트",
  MA: "모로코",
  KE: "케냐",
  ET: "에티오피아",
  AE: "아랍에미리트",
  IL: "이스라엘",
  SA: "사우디아라비아",
  QA: "카타르",
};

const EN_NAMES: Record<string, string> = {
  KR: "South Korea",
  US: "United States",
  GB: "United Kingdom",
  JP: "Japan",
  CN: "China",
  TW: "Taiwan",
  HK: "Hong Kong",
  SG: "Singapore",
  TH: "Thailand",
  VN: "Vietnam",
  IN: "India",
  ID: "Indonesia",
  MY: "Malaysia",
  PH: "Philippines",
  AU: "Australia",
  NZ: "New Zealand",
  CA: "Canada",
  MX: "Mexico",
  BR: "Brazil",
  AR: "Argentina",
  CL: "Chile",
  PE: "Peru",
  CO: "Colombia",
  FR: "France",
  DE: "Germany",
  IT: "Italy",
  ES: "Spain",
  PT: "Portugal",
  CH: "Switzerland",
  AT: "Austria",
  NL: "Netherlands",
  BE: "Belgium",
  IE: "Ireland",
  SE: "Sweden",
  NO: "Norway",
  FI: "Finland",
  DK: "Denmark",
  IS: "Iceland",
  PL: "Poland",
  CZ: "Czechia",
  HU: "Hungary",
  GR: "Greece",
  TR: "Türkiye",
  RU: "Russia",
  UA: "Ukraine",
  ZA: "South Africa",
  EG: "Egypt",
  MA: "Morocco",
  KE: "Kenya",
  ET: "Ethiopia",
  AE: "United Arab Emirates",
  IL: "Israel",
  SA: "Saudi Arabia",
  QA: "Qatar",
};

export function countryName(
  code: string | null | undefined,
  locale: "ko" | "en" | string = "ko",
  fallback?: string | null,
): string {
  if (!code) return fallback ?? "—";
  const upper = code.toUpperCase();
  const map = locale === "en" ? EN_NAMES : KO_NAMES;
  return map[upper] ?? fallback ?? upper;
}

/** @deprecated use countryName(code, locale, fallback) */
export function countryNameKo(code: string | null | undefined, fallback?: string | null): string {
  return countryName(code, "ko", fallback);
}
