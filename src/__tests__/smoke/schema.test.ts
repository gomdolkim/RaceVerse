import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const enabled = !!(url && key);

describe.runIf(enabled)("Supabase schema parity", () => {
  // Clients are created INSIDE each test rather than at describe-time so the
  // describe callback can be evaluated even when env vars are absent (vitest
  // still walks describe blocks regardless of `runIf`).
  const getClient = () => createClient(url!, key!);

  it("can SELECT from races_public view", async () => {
    const supabase = getClient();
    const { data, error } = await supabase.from("races_public").select("*").limit(1);
    expect(error, JSON.stringify(error)).toBeNull();
    expect(data).toBeDefined();
  });

  it("can SELECT from race_with_next_edition view", async () => {
    const supabase = getClient();
    const { data, error } = await supabase.from("race_with_next_edition").select("*").limit(1);
    expect(error, JSON.stringify(error)).toBeNull();
    expect(data).toBeDefined();
  });

  it("can SELECT from country_stats view", async () => {
    const supabase = getClient();
    const { data, error } = await supabase.from("country_stats").select("*").limit(1);
    expect(error, JSON.stringify(error)).toBeNull();
    expect(data).toBeDefined();
  });

  it("can call search_races RPC", async () => {
    const supabase = getClient();
    // biome-ignore lint/suspicious/noExplicitAny: untyped RPC for smoke
    const { error } = await supabase.rpc("search_races", { limit_count: 1 } as any);
    expect(error, JSON.stringify(error)).toBeNull();
  });
});

describe.runIf(!enabled)("Supabase smoke (skipped)", () => {
  it("skipped: NEXT_PUBLIC_SUPABASE_URL or _ANON_KEY missing", () => {
    expect(true).toBe(true);
  });
});
