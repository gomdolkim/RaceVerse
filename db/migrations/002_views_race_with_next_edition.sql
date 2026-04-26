-- RaceVerse: race + next upcoming edition + registration info

create or replace view public.race_with_next_edition as
select
  rp.*,
  e.id                         as edition_id,
  e.edition_year,
  e.event_date,
  e.event_end_date,
  e.status                     as edition_status,
  e.participant_limit,
  e.registered_count,
  e.edition_name,
  e.notes                      as edition_notes,
  reg.registration_url,
  reg.registration_platform,
  reg.opens_at                 as registration_opens_at,
  reg.closes_at                as registration_closes_at,
  reg.price_amount,
  reg.price_currency,
  reg.early_bird_price,
  reg.early_bird_deadline,
  reg.lottery_required,
  reg.qualifying_time_required,
  reg.waitlist_available,
  reg.registration_notes,
  reg.how_to_register
from public.races_public rp
left join lateral (
  select e.*
  from public.race_editions e
  where e.race_id = rp.id
    and (e.event_date is null or e.event_date >= current_date)
  order by e.event_date asc nulls last
  limit 1
) e on true
left join public.registration_info reg on reg.race_edition_id = e.id;

grant select on public.race_with_next_edition to anon, authenticated;
