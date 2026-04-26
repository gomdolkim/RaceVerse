-- RaceVerse: full-featured search RPC
-- Used by /races filter page and command palette

create or replace function public.search_races(
  countries     text[]   default null,
  types         text[]   default null,
  distance_min  numeric  default null,
  distance_max  numeric  default null,
  date_from     date     default null,
  date_to       date     default null,
  search_query  text     default null,
  only_with_registration boolean default false,
  limit_count   int      default 24,
  offset_count  int      default 0
)
returns setof public.race_with_next_edition
language sql
stable
as $$
  select distinct on (rwe.id) rwe.*
  from public.race_with_next_edition rwe
  left join public.race_distances rd on rd.race_edition_id = rwe.edition_id
  where rwe.primary_type <> 'unknown'
    and rwe.event_date is not null
    and (countries is null or rwe.country_code = any(countries))
    and (types is null or rwe.primary_type::text = any(types))
    and (distance_min is null or rd.distance_km >= distance_min)
    and (distance_max is null or rd.distance_km <= distance_max)
    and (date_from is null or rwe.event_date >= date_from)
    and (date_to   is null or rwe.event_date <= date_to)
    and (
      search_query is null
      or rwe.canonical_name ilike '%' || search_query || '%'
      or rwe.search_text    ilike '%' || search_query || '%'
    )
    and (not only_with_registration or rwe.registration_url is not null)
  order by rwe.id, rwe.event_date asc nulls last
  offset offset_count
  limit  limit_count;
$$;

grant execute on function public.search_races to anon, authenticated;
