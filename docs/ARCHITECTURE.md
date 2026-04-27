# RaceVerse — 기능 명세 & 소프트웨어 아키텍처

> 전 세계 마라톤·트레일·울트라 대회를 한 곳에 모아 보여주는 오픈 카탈로그
> 웹사이트. 사용자는 대회를 검색·필터링하고, 지도와 캘린더에서 탐색하며,
> 관심 국가를 저장해 다음 방문 때 그대로 이어볼 수 있습니다.

- **운영 URL**: https://race-verse.vercel.app
- **백엔드 (별도 repo)**: https://github.com/gomdolkim/RunningApi
- **프론트엔드 (이 repo)**: `/Users/komi/repo/RaceVerse`
- **규모**: TypeScript / TSX 99개 파일, 약 7,900 LOC
- **빌드 결과**: 26개 페이지 (KO + EN locale별 prerender, ISR/SSR 혼합)

---

## 1. 시스템 개요

```
┌──────────────────────────────────────────────────────────────────────┐
│                         RaceVerse Architecture                       │
└──────────────────────────────────────────────────────────────────────┘

   ┌──────────────────┐    매 6시간      ┌──────────────────┐
   │  Source Sites    │ ───── crawl ───▶ │ Backend (Python) │
   │  worldsmarathons │                  │ Railway cron     │
   │  UTMB World      │                  │ gomdolkim/       │
   │  ITRA            │                  │   RunningApi     │
   └──────────────────┘                  └────────┬─────────┘
                                                  │ upsert
                                                  │ (service_role)
                                                  ▼
                                       ┌────────────────────┐
                                       │ Supabase Postgres  │
                                       │  + PostGIS         │
                                       │ Tables · Views ·   │
                                       │   RPCs · RLS       │
                                       └────────┬───────────┘
                                                │ SELECT only
                                                │ (anon key,
                                                │  RLS protected)
                                                ▼
                              ┌──────────────────────────────┐
                              │  RaceVerse — Next.js 15      │
                              │  (this repo)                 │
                              │                              │
                              │  • Server components (RSC)   │
                              │  • API routes (Edge/Node)    │
                              │  • Client components         │
                              │  • Cookie-based prefs        │
                              │  • i18n: KO 기본 + EN        │
                              └────────┬─────────────────────┘
                                       │ HTML / JSON / OG image
                                       ▼
                              ┌──────────────────────────────┐
                              │  Browser (Desktop / Mobile)  │
                              │  • PWA manifest              │
                              │  • Bottom nav (mobile)       │
                              │  • Map / Calendar / Filters  │
                              └──────────────────────────────┘
```

이 repo는 **frontend only**. 데이터를 쓰지 않고 anon key로 SELECT만 합니다.
크롤러·DB 마이그레이션은 별도 백엔드 repo에서 운영됩니다.

---

## 2. 기술 스택

| 레이어 | 기술 |
|---|---|
| Framework | Next.js 15 App Router · React 19 |
| Language | TypeScript 5.6 (strict) |
| Styling | Tailwind CSS 3 + 자체 oklch 디자인 토큰 |
| UI primitives | Radix UI + shadcn/ui (vendored) |
| Data | `@supabase/ssr` + `@supabase/supabase-js` |
| Server state | React Server Components + ISR |
| Client state | Zustand-style local state · URL `searchParams` |
| Forms | react-hook-form + zod |
| Animation | Framer Motion 11 |
| Map | MapLibre GL + supercluster |
| Charts | Recharts |
| Date | date-fns + date-fns-tz |
| i18n | next-intl (KO / EN, KO 기본) |
| Icons | lucide-react |
| Linter / Formatter | Biome 1.9 |
| Test | Vitest + Playwright (smoke / unit / e2e) |
| Analytics | Vercel Analytics + Speed Insights |
| Hosting | Vercel (Edge / Node runtime per route) |

---

## 3. 디렉토리 구조

```
src/
├── app/
│   ├── [locale]/                       # i18n 라우트
│   │   ├── layout.tsx                  # NextIntlProvider, Nav, Footer, BottomNav
│   │   ├── page.tsx                    # 홈
│   │   ├── races/
│   │   │   ├── page.tsx                # 대회 목록 + 필터
│   │   │   └── [slug]/
│   │   │       ├── page.tsx            # 대회 상세 (ISR)
│   │   │       └── opengraph-image.tsx # 동적 OG 이미지
│   │   ├── calendar/page.tsx           # 월별 캘린더 (URL-paginated)
│   │   ├── map/
│   │   │   ├── page.tsx                # 지도
│   │   │   └── MapClient.tsx           # 클라이언트 wrapper
│   │   ├── countries/
│   │   │   ├── page.tsx                # 국가 그리드
│   │   │   └── [code]/page.tsx         # 국가별 대회
│   │   ├── trail/page.tsx              # 트레일/울트라 전용
│   │   ├── road/page.tsx               # 로드 마라톤 전용
│   │   ├── insights/page.tsx           # 통계 차트
│   │   ├── about/page.tsx              # 소개
│   │   ├── legal/[doc]/page.tsx        # 개인정보처리방침/이용약관
│   │   ├── error.tsx                   # 에러 boundary
│   │   └── not-found.tsx
│   ├── api/
│   │   ├── search/route.ts             # 명령 팔레트 검색 (RPC)
│   │   ├── races-bbox/route.ts         # 지도 마커 (페이지네이션 + antimeridian)
│   │   ├── races-near/route.ts         # 내 주변 검색 (PostGIS RPC)
│   │   └── ics/[editionId]/route.ts    # 캘린더 .ics 다운로드
│   ├── layout.tsx                      # 루트 (폰트, 메타데이터)
│   ├── global-error.tsx
│   ├── sitemap.ts                      # /sitemap.xml
│   └── robots.ts                       # /robots.txt
│
├── components/
│   ├── brand/                          # Logo, Wordmark
│   ├── layout/                         # Nav, BottomNav, Footer, ThemeSwitcher,
│   │                                   #   LocaleSwitcher, HeroBackdrop
│   ├── home/                           # Hero, StatsRow, SectionHeader,
│   │                                   #   CountriesStrip, InterestsSection
│   ├── race/                           # RaceCard, RaceList, RaceHero,
│   │                                   #   DistanceCard, RegistrationCard,
│   │                                   #   ShareButtons, AddToCalendar,
│   │                                   #   RelatedRaces, CountryFlag
│   ├── filter/                         # FilterBar (mobile staged), Pagination,
│   │                                   #   CountryPicker (mobile sheet / desktop popover)
│   ├── calendar/                       # CalendarGrid (URL-driven month nav)
│   ├── map/                            # RaceMap (MapLibre + supercluster + LRU cache)
│   ├── command/                        # CommandPalette (cmd+K)
│   ├── charts/                         # InsightsCharts (4 charts, Recharts)
│   ├── motion/                         # FadeIn, Stagger, CountUp
│   ├── feedback/                       # EmptyState, RaceCardSkeleton
│   ├── providers/                      # next-themes + react-query
│   └── ui/                             # shadcn primitives (Button, Card, Input,
│                                       #   Sheet, Dialog, Popover, ScrollArea,
│                                       #   Tooltip, Command, Skeleton, Badge,
│                                       #   Separator)
│
├── lib/
│   ├── supabase/
│   │   ├── server.ts                   # createServerClient (cookies)
│   │   ├── client.ts                   # createBrowserClient (singleton)
│   │   └── types.ts                    # Database type (manually maintained)
│   ├── queries/                        # 모든 read 쿼리
│   │   ├── races.ts                    # listRaces, getRaceBySlug, listRacesForMonth,
│   │   │                               #   getEarliest/LatestUpcomingMonth,
│   │   │                               #   getDatasetCounts, dropHidden helper
│   │   ├── countries.ts                # listCountries (DB 직접 집계)
│   │   └── stats.ts                    # 4 chart queries (페이지네이션)
│   ├── prefs/
│   │   ├── filter-prefs.ts             # filter cookie (countries/types/...)
│   │   └── interests.ts                # interests cookie (홈 관심 국가)
│   ├── url-state/filters.ts            # URL ↔ filter codec
│   ├── format/
│   │   ├── date.ts                     # locale-aware date formatting
│   │   ├── country.ts                  # ~250개국 한/영 매핑
│   │   ├── race.ts                     # primary_type label/badge
│   │   └── maps.ts                     # Google Maps URL builder
│   ├── geo/ewkb.ts                     # PostGIS EWKB hex 파서 (fallback)
│   ├── i18n/                           # next-intl config / routing
│   ├── ics/builder.ts                  # RFC 5545 .ics generator
│   ├── seo/jsonld.ts                   # schema.org SportsEvent
│   └── utils.ts                        # cn, formatNumber, formatPrice
│
├── styles/
│   ├── globals.css                     # base + components + utilities
│   └── tokens.css                      # oklch design tokens (light + dark)
│
├── middleware.ts                       # next-intl locale routing
└── __tests__/
    ├── setup.ts                        # vitest setup
    ├── smoke/schema.test.ts            # Supabase schema parity
    ├── lib/format/maps.test.ts         # googleMapsUrl 7 cases
    ├── lib/prefs/filter-prefs.test.ts  # parsePrefs 9 cases
    └── lib/geo/ewkb.test.ts            # parseEwkbPoint 4 cases

db/migrations/                          # 백엔드에 적용할 SQL pack
├── 001_views_races_public.sql          # races + locations + organizers join view
├── 002_views_race_with_next_edition.sql# + next-edition + registration_info
├── 003_rpc_search_races.sql            # search RPC (filters + 풀텍스트)
├── 004_rpc_races_in_bbox.sql           # 지도 bbox RPC
├── 005_rpc_races_near.sql              # PostGIS 반경 RPC
└── 006_view_country_stats.sql          # /countries 그리드용 집계 view

messages/
├── ko.json                             # 한국어 (1차)
└── en.json                             # 영어
```

---

## 4. 라우트 맵

| 경로 | 렌더링 | 캐시 | 설명 |
|---|---|---|---|
| `/` (`/[locale]`) | SSR (cookies) | revalidate 30분 | Hero + 통계 + 관심 국가 + featured 4섹션 |
| `/races` | SSR | revalidate 10분 | 검색·필터·페이지네이션 |
| `/races/[slug]` | ISR | revalidate 1시간 | 상세 페이지 + JSON-LD + OG image |
| `/races/[slug]/opengraph-image` | Edge | OG 이미지 (1200×630) |
| `/calendar` | SSR | revalidate 30분 | 월별 캘린더 (`?month=YYYY-MM`) |
| `/map` | Static | — | MapLibre 지도 (클라이언트 fetch) |
| `/countries` | Static | revalidate 1시간 | 국가 그리드 |
| `/countries/[code]` | SSR | revalidate 1시간 | 국가별 대회 |
| `/trail` | Static | revalidate 30분 | 트레일·울트라 전용 |
| `/road` | Static | revalidate 30분 | 로드 마라톤 전용 |
| `/insights` | Static | revalidate 1시간 | 4개 차트 |
| `/about`, `/legal/{privacy,terms}` | Static | — | 정적 |
| `/api/search` | Node | 2분 cache | cmd+K 검색 |
| `/api/races-bbox` | Node | 2분 cache | 지도 마커 (페이지네이션 + antimeridian) |
| `/api/races-near` | Node | — | 내 주변 |
| `/api/ics/[editionId]` | Node | 1시간 | .ics 다운로드 |
| `/sitemap.xml`, `/robots.txt` | Static | 24시간 | SEO |

각 라우트는 KO와 EN 버전이 자동 생성됩니다 (`/[locale]/` 폴더 + `as-needed`
prefix → KO는 prefix 없이 `/`, EN은 `/en/...`).

---

## 5. 데이터 모델 (DB는 백엔드 소유)

### 핵심 테이블 (read-only via anon)
- `races` — 대회 시리즈 (canonical_name, slug, primary_type, location_id, ...)
- `race_editions` — 연도별 인스턴스 (race_id, event_date, status, ...)
- `race_distances` — 거리 카테고리 (race_edition_id, distance_km, elevation, ITRA/UTMB)
- `locations` — PostGIS POINT 좌표 (city, region, country_code, geo_point)
- `registration_info` — 등록 URL, 가격, 마감, 추첨 여부
- `organizers`, `tags`, `race_tags`, `race_media`

### 우리가 추가한 read view + RPC (`db/migrations/`)
- `races_public` — `races` + `locations` + `organizers` join, EWKB → lat/lng 분해
- `race_with_next_edition` — `races_public` + 다음 미래 edition + registration_info
- `country_stats` — 국가별 race count 집계 (앱에서 직접 집계로 대체됨)
- `search_races(...)` — 다중 필터 + 풀텍스트 RPC
- `races_in_bbox(...)` — 지도 영역 마커 RPC
- `races_near(lat, lon, radius_km)` — PostGIS 반경 검색

### 데이터 정제 정책
다음은 **모든 디스커버리 면에서 숨김**:
- `primary_type IN ('unknown', 'road_other')`
- `event_date IS NULL` (직접 링크는 살아있음, 목록에서만 제외)

`getRaceBySlug`만 예외 — 직접 URL은 항상 동작.

---

## 6. 페이지별 기능

### 홈 (`/`)
- **Hero**: 그라데이션 메시 + 노이즈 + Fraunces 디스플레이 폰트, DB 실시간 카운트 (`5,547개 대회 / 4,185곳 위치`)
- **Stats Row**: CountUp 애니메이션 (race · 좌표 · 국가 · 등록가능)
- **관심 국가 섹션** (이번 작업 핵심):
  - 첫 방문: accent 그라데이션 카드 + 국가 선택 CTA
  - 저장 후: 그 국가의 다음 12개 race를 자동 표시
  - "수정" 버튼으로 언제든 변경
  - 쿠키 동기화 → /races, /calendar에도 자동 반영
- **Featured 4섹션**: 임박 메이저 / 트레일 / 최근 추가 / 인기 국가

### 대회 목록 (`/races`)
- **검색 바** + 종목 chip + 국가 picker + "등록 가능만" 토글
- **활성 chip 행** — 적용된 필터 시각화, 개별 X로 제거
- **모바일 staged 필터 sheet** — 적용 버튼 누르기 전엔 URL 안 건드림
- **페이지네이션** — 24개씩, RPC 경로는 `limit+1` probe로 정확한 hasMore
- **쿠키 → URL redirect** — 홈에서 저장한 관심 국가가 바로 적용
- 결과 없을 때 EmptyState

### 대회 상세 (`/races/[slug]`)
- **RaceHero**: 국기 + 국가/지역/도시 (Google Maps 링크) + 제목 + 종목/연도/D-day 배지 + 일정 + 주최 정보 + 설명
- **모바일에서는 등록 카드 먼저** (order utility로 제어)
- **DistanceCard 그리드**: 거리·고도·ITRA/UTMB·제한시간·출발시간
- **RegistrationCard**: 등록 URL, 가격, 얼리버드, 추첨/기록 인증/대기열, 참가 가이드
- **공유**: 네이티브 Web Share + X + LinkedIn + 링크 복사
- **캘린더 추가**: Google + .ics 다운로드 (RFC 5545)
- **JSON-LD `SportsEvent`** schema → 검색엔진 풍부한 결과
- **동적 OG 이미지**: 라이트닝 그라데이션 + 국기 이모지 + 종목 배지 + 날짜 (locale별 한/영)
- **canonical URL** 메타데이터로 SEO

### 캘린더 (`/calendar`)
- **URL-driven 월별 페이지네이션** (`?month=YYYY-MM`)
- **5,000-row 한계 해결** — 한 달 단위 fetch, 데이터베이스의 모든 미래 일정 노출
- **부드러운 month 전환** — useTransition + Framer Motion
- **boundary disabled** — 가장 먼 / 가장 가까운 월 자동 계산
- **셀 = 카운트 카드** — 작은 chip 대신 큰 숫자 + 국기 4개 + "+더 보기" 힌트
- **셀 클릭 → 다이얼로그** — 그날의 모든 race 스크롤 리스트
- **국가 필터 + 종목 필터** — 양쪽 모두 쿠키 동기화
- **월에 race 없을 때**: "{가장 가까운 월}로 이동" 힌트 + 점프 버튼

### 지도 (`/map`)
- **MapLibre GL** + Maptiler/CartoDB 베이스 타일 (light/dark 테마 따라 전환)
- **supercluster** — 5,000+ 마커도 60fps
- **Bbox-driven fetch** — 영역 변경 시 자동 갱신, 1000개씩 페이지네이션
- **Antimeridian crossing** — `west > east`인 경우 두 쿼리로 분할 후 merge (태평양 영역 비어보이는 버그 수정)
- **LRU eviction** — 5,000 entries cap, 메모리 누수 방지
- **마커 탭 → bottom sheet** — 모바일에서 자연스러운 race 미리보기
- **"내 위치" 버튼** — geolocation 기반 flyTo

### 국가 (`/countries`, `/countries/[code]`)
- 그리드: ~250개국 ISO 매핑 (`unknown`/`road_other` 제외, race_count > 0만)
- 국가 상세: 통계 4개 + 그 국가의 race 목록

### 인사이트 (`/insights`)
4개 차트 (Recharts):
1. **월별 일정** — 페이지네이션 집계, DB 모든 미래 일정
2. **종목별 분포** — 도넛 (road/trail/ultra/...)
3. **거리 분포** — `<10K`, `10–25K`, `25–50K`, `50–100K`, `100K+` 5개 깔끔한 버킷
4. **상위 국가** — 가로 bar (앱에서 직접 집계, country_stats view 우회)

### 명령 팔레트 (cmd+K)
- 어디서든 ⌘K로 열기
- 빠른 이동 (홈/대회/캘린더/지도/국가별/트레일)
- 검색어 입력 → debounced typeahead → 12개 결과
- result 클릭 시 race 상세로 이동

---

## 7. 디자인 시스템

### 색상 (oklch)
- 라이트/다크 별도 팔레트 (단순 inverted X)
- Brand accent: **Sunset Coral** `oklch(0.685 0.18 28)`
- Surfaces: 4-단계 elevation (bg / surface / surface-raised / surface-overlay)
- Status: success / warning / danger

### 타이포그래피
- **Display**: Fraunces (variable serif, opsz·SOFT 축)
- **Body**: Inter
- **Mono**: JetBrains Mono
- 모두 `next/font` self-host + subset

### 모션
- duration tokens: `instant 80ms / quick 160ms / base 240ms / slow 400ms / cinematic 680ms`
- easing: cubic-bezier `(0.16, 1, 0.3, 1)` (out-expo)
- `prefers-reduced-motion` 자동 적용

### 미세 디테일
- gradient mesh hero + SVG noise overlay
- glass surfaces (`backdrop-blur-xl`)
- card hover-tilt (Framer Motion + spring)
- tabular-nums everywhere for counts/dates
- 둥근 radius 스케일 (xs:4 → 2xl:28)

---

## 8. 사용자 흐름

### 첫 방문 (모바일 가정)
1. **홈**: KO 강제, hero + 관심 국가 카드 표시
2. **국가 선택** → bottom sheet 풀폭으로 픽커 → 한국·일본 선택 → "저장"
3. → `interests` + `filter_prefs` 두 쿠키 동기화 (max-age 1년)
4. → `router.refresh()` → 그 국가의 다음 12개 race 자동 표시 (UI 깜빡임 없음)
5. **하단 5탭 navigation** 노출: 홈 / 대회 / 캘린더 / 지도 / 국가별
6. **/races 탭** → 서버가 쿠키 읽음 → URL에 자동 redirect → 한국·일본 race 페이지네이션

### 재방문 (브라우저 종료 후)
- 쿠키 1년 max-age로 유지 → 모든 필터 그대로 복원
- 홈에서 관심 국가 race 자동 표시
- /races, /calendar에서도 동일한 필터 적용

### 대회 등록 흐름
1. RaceCard 클릭 → 상세 페이지
2. 모바일: 등록 카드가 hero 바로 아래
3. "공식 등록" 버튼 → 외부 사이트 새 탭
4. 또는 "캘린더에 추가" → Google / .ics

---

## 9. i18n & 로컬라이제이션

- **기본 locale**: `ko` (`localeDetection: false`로 첫 방문 시 강제)
- **다른 locale**: `en` — 우상단 popover에서 전환 (`NEXT_LOCALE` 쿠키)
- **prefix**: `as-needed` → KO는 `/...`, EN은 `/en/...`
- **메시지**: `messages/ko.json` + `messages/en.json` (parity 유지, 모든 키 양쪽 존재)
- **Date**: date-fns + `enUS`/`ko` locale, `en-US`/`ko-KR` 같은 BCP-47도 안전
- **Country names**: ~250개국 매핑, ISO 코드 fallback
- **Race name**: 원어 그대로 (CJK·Cyrillic·Latin), 폰트 스택에 Noto CJK fallback

---

## 10. 모바일 UX

| 영역 | 처리 |
|---|---|
| 홈 hero | 큰 헤드라인 + safe-area top |
| Bottom Navigation | 5탭 fixed, glass blur, safe-area-inset-bottom 자동 |
| Country picker | 모바일 → bottom sheet, 데스크탑 → popover |
| Filter sheet (대회) | staged 선택 → "적용" 버튼 → 한 번에 URL 갱신 |
| 등록 카드 | order utility로 모바일에서 hero 바로 아래 |
| Map | safe-area + 하단 nav 분량 자동 빼기 |
| 키보드 줌인 방지 | input/textarea 모바일에서 16px 강제 (iOS Safari 자동 zoom 차단) |
| 키보드 가림 방지 | `env(keyboard-inset-height)` padding으로 sheet action bar 노출 |
| Touch target | ≥48px 권장 따라 picker row `py-3` |

---

## 11. 쿠키 / 저장된 사용자 환경

### `raceverse_interests` (1년)
홈 화면 관심 국가 — `null` (첫 방문) / `[]` (skip) / `["KR","JP",...]`

### `raceverse_filter_prefs` (1년)
대회 필터 prefs — countries / types / onlyWithRegistration / dateFrom / dateTo
- 홈 InterestsSection이 저장 시 동기화
- /races FilterBar useEffect가 URL 변경 시 merge 저장 (다른 필드 보존)
- /calendar CalendarGrid도 동일 패턴
- 서버에서 `parsePrefs`가 defensive shape validation (tampered cookie 방어)

### `NEXT_LOCALE` (next-intl 자동)
사용자 선택 언어 — Locale switcher 클릭 시 next-intl이 자동 설정

---

## 12. SEO

- 동적 sitemap (`/sitemap.xml`) — top 5,000 races, 24h revalidate
- robots.txt
- Per-page metadata (title, description, OG, Twitter card)
- canonical URL — race 상세 페이지에 명시적 alternates.canonical
- JSON-LD `SportsEvent` schema (date, location, organizer, offers)
- 동적 OG 이미지 (locale별 한/영, race 정보 포함)

---

## 13. 성능

- ISR `revalidate` per route (10분 ~ 24시간)
- Server-side 페이지네이션 (`?offset`, `?month`)
- API route 응답 캐시 (s-maxage)
- 슬림 SELECT (필요 컬럼만, 특히 지도/캘린더)
- next/font self-host + preload + subset
- Code splitting per route (Map은 dynamic import)
- LRU eviction 5,000 (지도 메모리 cap)
- Vercel Analytics + Speed Insights

---

## 14. 보안 / 프라이버시

- anon key only (service_role 절대 클라이언트 노출 X)
- Supabase RLS public read (write 차단)
- Cookies: `SameSite=Lax`, `path=/`, no sensitive data
- HTTPS 자동 (Vercel)
- 사용자 계정 정보 수집 없음 — 익명 분석만
- HSTS, X-Content-Type-Options, X-Frame-Options, Permissions-Policy
  (vercel.json)
- 입력 sanitization 불필요 (read-only, 사용자 텍스트 저장 없음)

---

## 15. 테스트

```
src/__tests__/
  smoke/schema.test.ts         5 tests   Supabase parity (env 있을 때만)
src/lib/
  format/maps.test.ts          7 tests   googleMapsUrl + null-island + edge cases
  prefs/filter-prefs.test.ts   9 tests   parsePrefs + tampering + meaningful check
  geo/ewkb.test.ts             4 tests   EWKB 파서
                              ─────────
                              총 25 tests, 21 pass + 4 skip (smoke = env-gated)
```

CI: GitHub Actions (`.github/workflows/ci.yml`)
- typecheck (`tsc --noEmit`)
- lint (Biome)
- unit tests (Vitest)
- production build

---

## 16. 배포

- **Vercel** — GitHub push → auto preview, main → production
- **환경 변수** (Vercel Project Settings → Environment Variables):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_SITE_URL`
- **DB 마이그레이션**: `db/migrations/*.sql`을 Supabase Studio에 1회 적용 (`db/README.md` 참조)
- **Analytics**: Vercel Dashboard → Analytics + Speed Insights enable

---

## 17. 주요 버그 수정 이력 (감사 결과)

### HIGH
- OG image `params` await 누락 (Next.js 15 호환)
- AddToCalendar / RelatedRaces / RaceMap 한국어 하드코딩
- RaceHero `<dd>` invalid HTML
- /races redirect locale 누락 (무한 루프)
- FilterBar applyStaged가 검색어 drop
- /races RPC path count 부정확 → `limit+1` probe
- /api/races-near `road_other` 미필터

### MEDIUM
- googleMapsUrl null-island (0,0) → 거부
- filter-prefs cookie tampering 방어
- date.ts BCP-47 locale tolerance
- 지도 marker 5,000-row 한계 → 페이지네이션
- 캘린더 5,000-row 한계 → 월별 SSR 페이지네이션
- 인사이트 차트 4개 모두 정확도 개선 (페이지네이션 + 직접 집계)
- 국가 카운트 일관성 (view 우회, 직접 집계)
- BBox antimeridian crossing
- Map LRU eviction
- about p1 6h vs 2h 일관성

### LOW UX
- iOS Safari 16px input auto-zoom 방지
- CountryPicker 모바일 키보드 가림 (autoFocus 제거 + keyboard-inset-height)
- InterestsSection 저장 후 flash → pending 동안 picker 유지
- Map 페이지 safe-area inset

---

## 18. 향후 작업 (백로그)

- [ ] Sentry 에러 트래킹
- [ ] PWA service worker (오프라인 race 카드 캐시)
- [ ] 즐겨찾기 race (Supabase Auth 도입 후)
- [ ] 등록 마감 임박 알림 (이메일)
- [ ] 코스 GPX 표시
- [ ] 과거 결과 데이터 (Athlinks 통합)
- [ ] Race 후기 / rating
- [ ] 다국어 확장 (JA / ZH / FR — next-intl 이미 준비)
- [ ] React Native 앱 (Expo)

---

## 부록 A: 명령어

```bash
pnpm dev               # 개발 서버
pnpm build             # 프로덕션 빌드
pnpm start             # 프로덕션 서버
pnpm lint              # Biome 린트
pnpm lint:fix          # Biome 자동 수정
pnpm typecheck         # TypeScript 검증
pnpm test              # Vitest 단위 테스트
pnpm test:smoke        # Supabase 연결 검증
pnpm test:e2e          # Playwright E2E
pnpm gen:types         # Supabase 타입 자동 생성
```

## 부록 B: 환경 변수

```bash
# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=https://itxecxuqtwjqcmszmezl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Site (필수)
NEXT_PUBLIC_SITE_URL=https://race-verse.vercel.app

# Map (선택, 무료 데모 작동)
NEXT_PUBLIC_MAPTILER_KEY=
```
