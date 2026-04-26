-- RaceVerse: aggregated country stats for /countries and /insights

create or replace view public.country_stats as
select
  rp.country_code,
  rp.country_name,
  count(distinct rp.id)                                               as race_count,
  count(distinct rp.id) filter (where rp.primary_type = 'road_marathon') as marathon_count,
  count(distinct rp.id) filter (where rp.primary_type in ('trail','ultra')) as trail_count,
  count(distinct rp.id) filter (where rp.latitude is not null)        as geocoded_count
from public.races_public rp
where rp.country_code is not null
  and rp.is_active = true
group by rp.country_code, rp.country_name;

grant select on public.country_stats to anon, authenticated;
