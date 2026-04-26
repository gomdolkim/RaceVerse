# RaceVerse — DB Migration Pack

These SQL files are **read-only views and RPCs** that the RaceVerse frontend
expects to find on the shared Supabase project (`itxecxuqtwjqcmszmezl`).

> They do not modify any base table; they only `CREATE OR REPLACE VIEW`
> and `CREATE OR REPLACE FUNCTION` plus `GRANT` to `anon, authenticated`.

## How to apply

You can apply them in any of three ways. Pick whichever you prefer.

### Option A — Add to backend repo (recommended)

Copy each file into `gomdolkim/RunningApi/supabase/migrations/` with a
date-prefixed name and commit + run:

```bash
supabase db push
```

This is the long-term home for these objects.

### Option B — Paste into Supabase Studio

1. Go to https://supabase.com/dashboard/project/itxecxuqtwjqcmszmezl/sql/new
2. Paste each `.sql` file's contents and run, in order:
   - `001_views_races_public.sql`
   - `002_views_race_with_next_edition.sql`
   - `003_rpc_search_races.sql`
   - `004_rpc_races_in_bbox.sql`
   - `005_rpc_races_near.sql`
   - `006_view_country_stats.sql`

### Option C — Supabase CLI (one-off)

```bash
supabase db remote set "$DATABASE_URL"
for f in db/migrations/*.sql; do
  supabase db remote commit < "$f"
done
```

## Verifying

After applying, the smoke test in `src/__tests__/smoke/schema.test.ts`
should pass against the live anon key:

```bash
pnpm test:smoke
```
