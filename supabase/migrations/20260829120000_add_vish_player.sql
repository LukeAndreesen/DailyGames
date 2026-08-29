insert into public.players (
  slug,
  display_name,
  display_order
)
values (
  'vish',
  'Vish',
  8
)
on conflict (slug) do update set
  display_name = excluded.display_name,
  display_order = excluded.display_order,
  active = true;
