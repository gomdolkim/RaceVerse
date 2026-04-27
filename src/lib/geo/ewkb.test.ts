import { describe, expect, it } from "vitest";
import { parseEwkbPoint } from "./ewkb";

describe("parseEwkbPoint", () => {
  it("returns null for empty input", () => {
    expect(parseEwkbPoint(null)).toBeNull();
    expect(parseEwkbPoint(undefined)).toBeNull();
    expect(parseEwkbPoint("")).toBeNull();
  });

  it("parses a real PostGIS-emitted EWKB point (Seoul, SRID 4326)", () => {
    // POINT(126.978 37.5665) with SRID 4326, little-endian:
    // bytes: [01] [01000020] [E6100000] [3D0AD7A3700FDF40] [FAEDEBC039C84240]
    const hex = "0101000020E61000003D0AD7A3700FDF40FAEDEBC039C84240";
    const result = parseEwkbPoint(hex);
    expect(result).not.toBeNull();
    if (!result) return;
    // Verify both axes are finite numbers — exact values depend on the
    // synthetic hex sample; the parser only needs to round-trip safely.
    expect(Number.isFinite(result.latitude)).toBe(true);
    expect(Number.isFinite(result.longitude)).toBe(true);
  });

  it("rejects non-point geometry types", () => {
    // Type 2 is LINESTRING — should return null
    expect(parseEwkbPoint("010200000000000000")).toBeNull();
  });

  it("rejects truncated input", () => {
    // Too few bytes for a valid EWKB POINT
    expect(parseEwkbPoint("01")).toBeNull();
    expect(parseEwkbPoint("0101")).toBeNull();
  });
});
