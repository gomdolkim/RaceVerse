-- RaceVerse: PostGIS radius search

create or replace function public.races_near(
  lat         float8,
  lon         float8,
  radius_km   float8 default 50,
  limit_count int    default 100
)
returns setof public.race_with_next_edition
language sql
stable
as $$
  select rwe.*
  from public.race_with_next_edition rwe
  join public.locations l on l.id = rwe.location_id
  where rwe.primary_type <> 'unknown'
    and rwe.event_date is not null
    and l.geo_point is not null
    and ST_DWithin(
      l.geo_point,
      ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography,
      radius_km * 1000
    )
  order by ST_Distance(
    l.geo_point,
    ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
  ) asc
  limit limit_count;
$$;

grant execute on function public.races_near to anon, authenticated;
