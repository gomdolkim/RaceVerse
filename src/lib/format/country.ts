// ISO 3166-1 alpha-2 → flag emoji + Korean name lookups.
// For SVG flags we use the `country-flag-icons` package elsewhere.

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

export function countryNameKo(code: string | null | undefined, fallback?: string | null): string {
  if (!code) return fallback ?? "—";
  return KO_NAMES[code.toUpperCase()] ?? fallback ?? code;
}
