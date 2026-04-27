import { describe, expect, it } from "vitest";
import { googleMapsUrl, hasLocation } from "./maps";

describe("googleMapsUrl", () => {
  it("uses lat/lng coordinates when present", () => {
    const url = googleMapsUrl({ latitude: 37.5665, longitude: 126.978 });
    expect(url).toBe("https://www.google.com/maps/search/?api=1&query=37.5665,126.978");
  });

  it("rejects null-island (0,0) — common geocode failure", () => {
    expect(googleMapsUrl({ latitude: 0, longitude: 0 })).toBeNull();
  });

  it("falls back to text query when coordinates missing", () => {
    const url = googleMapsUrl({
      city: "Seoul",
      country_name: "South Korea",
    });
    expect(url).toContain("https://www.google.com/maps/search/?api=1&query=");
    expect(decodeURIComponent(url ?? "")).toContain("Seoul, South Korea");
  });

  it("dedupes consecutive duplicate parts (venue == city)", () => {
    const url = googleMapsUrl({
      venue_name: "Tokyo",
      city: "Tokyo",
      country_name: "Japan",
    });
    expect(decodeURIComponent(url ?? "")).toBe(
      "https://www.google.com/maps/search/?api=1&query=Tokyo, Japan",
    );
  });

  it("returns null when nothing locatable", () => {
    expect(googleMapsUrl({})).toBeNull();
    expect(googleMapsUrl({ city: "" })).toBeNull();
    expect(googleMapsUrl({ city: "   " })).toBeNull();
  });

  it("handles non-finite coords gracefully", () => {
    expect(googleMapsUrl({ latitude: Number.NaN, longitude: 0 })).toBeNull();
    expect(googleMapsUrl({ latitude: Number.POSITIVE_INFINITY, longitude: 0 })).toBeNull();
  });
});

describe("hasLocation", () => {
  it("matches googleMapsUrl semantics", () => {
    expect(hasLocation({ latitude: 37, longitude: 127 })).toBe(true);
    expect(hasLocation({ latitude: 0, longitude: 0 })).toBe(false);
    expect(hasLocation({})).toBe(false);
    expect(hasLocation({ city: "Berlin" })).toBe(true);
  });
});
