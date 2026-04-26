import type { RaceFilters } from "@/lib/queries/races";

export function parseFilters(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
): RaceFilters {
  const get = (key: string): string | undefined => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key) ?? undefined;
    }
    const v = searchParams[key];
    return Array.isArray(v) ? v[0] : v;
  };
  const split = (s: string | undefined) => (s ? s.split(",").filter(Boolean) : undefined);

  const distMin = get("distance_min");
  const distMax = get("distance_max");

  return {
    countries: split(get("country"))?.map((s) => s.toUpperCase()),
    types: split(get("type")),
    distanceMin: distMin ? Number(distMin) : undefined,
    distanceMax: distMax ? Number(distMax) : undefined,
    dateFrom: get("from"),
    dateTo: get("to"),
    q: get("q"),
    onlyWithRegistration: get("reg") === "1",
    limit: get("limit") ? Number(get("limit")) : 24,
    offset: get("offset") ? Number(get("offset")) : 0,
  };
}

export function serializeFilters(f: RaceFilters): URLSearchParams {
  const sp = new URLSearchParams();
  if (f.countries?.length) sp.set("country", f.countries.join(","));
  if (f.types?.length) sp.set("type", f.types.join(","));
  if (f.distanceMin !== undefined) sp.set("distance_min", String(f.distanceMin));
  if (f.distanceMax !== undefined) sp.set("distance_max", String(f.distanceMax));
  if (f.dateFrom) sp.set("from", f.dateFrom);
  if (f.dateTo) sp.set("to", f.dateTo);
  if (f.q) sp.set("q", f.q);
  if (f.onlyWithRegistration) sp.set("reg", "1");
  if (f.offset) sp.set("offset", String(f.offset));
  return sp;
}

export function isEmpty(f: RaceFilters): boolean {
  return (
    !f.countries?.length &&
    !f.types?.length &&
    f.distanceMin === undefined &&
    f.distanceMax === undefined &&
    !f.dateFrom &&
    !f.dateTo &&
    !f.q &&
    !f.onlyWithRegistration
  );
}
