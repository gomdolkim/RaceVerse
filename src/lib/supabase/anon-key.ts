// Helper to fail loudly when env is missing — instead of cryptic Supabase errors.
// Intended to run on server start (e.g., from instrumentation).

export function assertSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const missing: string[] = [];
  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!key) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (missing.length) {
    throw new Error(
      `RaceVerse: missing env vars: ${missing.join(", ")}. Copy .env.example to .env.local and fill in the anon key from https://supabase.com/dashboard/project/itxecxuqtwjqcmszmezl/settings/api`,
    );
  }
}
