-- RaceVerse: bbox-driven map fetch

create or replace function public.races_in_bbox(
  west       float8,
  south      float8,
  east       float8,
  north      float8,
  limit_count int default 500
)
returns setof public.race_with_next_edition
language sql
stable
as $$
  select rwe.*
  from public.race_with_next_edition rwe
  where rwe.primary_type <> 'unknown'
    and rwe.event_date is not null
    and rwe.longitude is not null
    and rwe.latitude  is not null
    and rwe.longitude between west and east
    and rwe.latitude  between south and north
  order by rwe.event_date asc
  limit limit_count;
$$;

grant execute on function public.races_in_bbox to anon, authenticated;
