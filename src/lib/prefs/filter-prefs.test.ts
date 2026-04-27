import { describe, expect, it } from "vitest";
import { hasMeaningfulPrefs, parsePrefs } from "./filter-prefs";

describe("parsePrefs", () => {
  it("returns null for missing/empty input", () => {
    expect(parsePrefs(undefined)).toBeNull();
    expect(parsePrefs("")).toBeNull();
  });

  it("parses a valid encoded JSON cookie", () => {
    const raw = encodeURIComponent(JSON.stringify({ countries: ["KR", "JP"], types: ["trail"] }));
    const parsed = parsePrefs(raw);
    expect(parsed).toEqual({ countries: ["KR", "JP"], types: ["trail"] });
  });

  it("drops fields with wrong shapes (defensive)", () => {
    // tampered cookie where countries is a string instead of an array
    const raw = encodeURIComponent(JSON.stringify({ countries: "KR", types: ["trail"] }));
    const parsed = parsePrefs(raw);
    expect(parsed?.countries).toBeUndefined();
    expect(parsed?.types).toEqual(["trail"]);
  });

  it("returns null for invalid JSON", () => {
    expect(parsePrefs("not-json")).toBeNull();
    expect(parsePrefs("%7Bnot-json")).toBeNull();
  });

  it("returns null for primitive JSON", () => {
    expect(parsePrefs(encodeURIComponent('"a string"'))).toBeNull();
    expect(parsePrefs(encodeURIComponent("42"))).toBeNull();
  });

  it("preserves boolean / date string fields", () => {
    const raw = encodeURIComponent(
      JSON.stringify({
        onlyWithRegistration: true,
        dateFrom: "2026-04-26",
      }),
    );
    const parsed = parsePrefs(raw);
    expect(parsed?.onlyWithRegistration).toBe(true);
    expect(parsed?.dateFrom).toBe("2026-04-26");
  });
});

describe("hasMeaningfulPrefs", () => {
  it("rejects null and empty objects", () => {
    expect(hasMeaningfulPrefs(null)).toBe(false);
    expect(hasMeaningfulPrefs({})).toBe(false);
  });

  it("rejects empty arrays", () => {
    expect(hasMeaningfulPrefs({ countries: [], types: [] })).toBe(false);
  });

  it("accepts non-empty filters", () => {
    expect(hasMeaningfulPrefs({ countries: ["KR"] })).toBe(true);
    expect(hasMeaningfulPrefs({ onlyWithRegistration: true })).toBe(true);
    expect(hasMeaningfulPrefs({ dateFrom: "2026-01-01" })).toBe(true);
  });
});
