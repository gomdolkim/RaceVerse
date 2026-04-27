import { describe, expect, it } from "vitest";
import { MAX_SAVED, parseIdsParam, parseSaved, toggleSaved } from "./saved";

const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";
const C = "33333333-3333-4333-8333-333333333333";

describe("parseSaved", () => {
  it("returns empty array for missing/invalid input", () => {
    expect(parseSaved(undefined)).toEqual([]);
    expect(parseSaved("")).toEqual([]);
    expect(parseSaved("not-json")).toEqual([]);
    expect(parseSaved(encodeURIComponent('"not an array"'))).toEqual([]);
  });

  it("parses a valid encoded array of UUIDs", () => {
    const raw = encodeURIComponent(JSON.stringify([A, B]));
    expect(parseSaved(raw)).toEqual([A, B]);
  });

  it("filters out non-UUID values (defensive)", () => {
    const raw = encodeURIComponent(JSON.stringify([A, "not-a-uuid", 42, B]));
    expect(parseSaved(raw)).toEqual([A, B]);
  });
});

describe("toggleSaved", () => {
  it("adds an id when absent (newest first)", () => {
    expect(toggleSaved([B, C], A)).toEqual([A, B, C]);
  });

  it("removes an id when present", () => {
    expect(toggleSaved([A, B, C], B)).toEqual([A, C]);
  });

  it("rejects invalid ids", () => {
    expect(toggleSaved([A], "not-a-uuid")).toEqual([A]);
  });

  it("caps at MAX_SAVED", () => {
    const many = Array.from(
      { length: MAX_SAVED },
      (_, i) => `${String(i).padStart(8, "0")}-1111-4111-8111-111111111111`,
    );
    const result = toggleSaved(many, A);
    expect(result).toHaveLength(MAX_SAVED);
    expect(result[0]).toBe(A);
  });
});

describe("parseIdsParam", () => {
  it("parses a comma-separated list", () => {
    expect(parseIdsParam(`${A},${B}`)).toEqual([A, B]);
  });

  it("trims whitespace and filters invalid ids", () => {
    expect(parseIdsParam(`  ${A}  , not-a-uuid , ${B}`)).toEqual([A, B]);
  });

  it("returns empty for null/undefined", () => {
    expect(parseIdsParam(null)).toEqual([]);
    expect(parseIdsParam(undefined)).toEqual([]);
    expect(parseIdsParam("")).toEqual([]);
  });
});
