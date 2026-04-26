-- RaceVerse: public-facing view for races
-- Apply this to the backend Supabase project (gomdolkim/RunningApi)
-- via either supabase migration or paste in Supabase Studio SQL editor.

create or replace view public.races_public as
select
  r.id,
  r.canonical_name,
  r.slug,
  r.description,
  r.website_url,
  r.primary_type,
  r.first_held_year,
  r.is_active,
  r.search_text,
  r.created_at,
  r.updated_at,
  l.id              as location_id,
  l.country_code,
  l.country_name,
  l.region,
  l.city,
  l.venue_name,
  l.address,
  l.timezone,
  case when l.geo_point is not null
       then ST_X(l.geo_point::geometry)::float8 end as longitude,
  case when l.geo_point is not null
       then ST_Y(l.geo_point::geometry)::float8 end as latitude,
  o.id              as organizer_id,
  o.name            as organizer_name,
  o.website         as organizer_website
from public.races r
left join public.locations  l on l.id = r.location_id
left join public.organizers o on o.id = r.organizer_id;

grant select on public.races_public to anon, authenticated;
