alter table public.games
add column if not exists scoring_starts_on date;

insert into public.games (
  id,
  slug,
  display_name,
  max_score,
  higher_is_better,
  display_order,
  scoring_starts_on
)
values (
  '00000000-0000-4000-8000-000000000105',
  'geosports',
  'GeoSports',
  1000,
  true,
  5,
  '2026-08-23'
)
on conflict (slug) do update set
  display_name = excluded.display_name,
  max_score = excluded.max_score,
  higher_is_better = excluded.higher_is_better,
  display_order = excluded.display_order,
  scoring_starts_on = excluded.scoring_starts_on;
