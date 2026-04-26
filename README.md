# RaceVerse

전 세계 5,500+ 마라톤·트레일을 한 곳에서 — Next.js 15 + Supabase + Vercel.

이 저장소는 [`gomdolkim/RunningApi`](https://github.com/gomdolkim/RunningApi)
백엔드(Python 크롤러 + Supabase Postgres)와 **DB만 공유**하는 frontend repo입니다.
설계 근거는 백엔드 repo의 [`docs/FRONTEND_ARCHITECTURE.md`](https://github.com/gomdolkim/RunningApi/blob/main/docs/FRONTEND_ARCHITECTURE.md) 입니다.

## Stack
- **Next.js 15** App Router · React 19 · TypeScript 5.6
- **Tailwind CSS 3** + 자체 oklch 토큰 + shadcn/ui
- **Supabase** (`@supabase/ssr`, anon key, RLS read-only)
- **TanStack Query** + Zustand
- **MapLibre GL** + supercluster
- **Recharts** (인사이트)
- **next-intl** — 한국어 1차, 영어 2차
- **Framer Motion** — premium micro-interactions
- **Biome** — 린트 + 포맷
- **Vitest + Playwright**

## 시작하기

### 1. 의존성 설치
```bash
pnpm install
```

### 2. 환경 변수
```bash
cp .env.example .env.local
# .env.local 편집:
# - NEXT_PUBLIC_SUPABASE_ANON_KEY를 Supabase 대시보드에서 복사
#   (https://supabase.com/dashboard/project/itxecxuqtwjqcmszmezl/settings/api)
```

> **중요**: anon public 키만 사용. service_role 키는 절대 클라이언트에 노출 금지.

### 3. DB 마이그레이션 적용 (1회)

`db/migrations/` 폴더의 SQL 파일들을 라이브 Supabase에 적용해야 합니다.
자세한 방법은 [`db/README.md`](./db/README.md) 참조.

### 4. 개발 서버
```bash
pnpm dev
```

http://localhost:3000

### 5. 스모크 테스트 (DB 연결 검증)
```bash
pnpm test:smoke
```

## 명령어

| 명령 | 설명 |
|---|---|
| `pnpm dev` | 개발 서버 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm start` | 프로덕션 서버 |
| `pnpm lint` / `pnpm lint:fix` | Biome 린트 |
| `pnpm typecheck` | TypeScript 검증 |
| `pnpm test` | Vitest 단위 테스트 |
| `pnpm test:e2e` | Playwright E2E |
| `pnpm gen:types` | Supabase 타입 자동 생성 |

## 디렉토리 구조

```
src/
├── app/                 # Next.js App Router
│   ├── (marketing)/     # 홈, 소개, 약관
│   ├── (explore)/       # races, calendar, map, countries, trail, insights
│   └── api/             # OG 이미지, search, ICS, sitemap
├── components/
│   ├── ui/              # shadcn primitives
│   ├── brand/           # Logo, Wordmark
│   ├── layout/          # Nav, Footer, Container
│   ├── race/            # RaceCard, RaceDetail, etc.
│   ├── filter/, map/, command/, charts/, feedback/, motion/
├── lib/
│   ├── supabase/        # 서버/클라이언트 클라이언트, 타입
│   ├── queries/         # 모든 read 쿼리
│   ├── geo/             # PostGIS 유틸
│   ├── i18n/, format/, seo/, ics/, url-state/
├── hooks/, stores/, styles/, __tests__/
db/migrations/           # 백엔드에 적용할 SQL
messages/                # ko.json, en.json
```

## 배포

GitHub repo를 [Vercel](https://vercel.com/new)에 연결하고 환경 변수
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`NEXT_PUBLIC_SITE_URL`)를 추가하면 자동 배포됩니다.
