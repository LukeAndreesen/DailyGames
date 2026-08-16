create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create table public.players (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  display_order integer not null check (display_order > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint players_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.games (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  max_score integer check (max_score is null or max_score > 0),
  higher_is_better boolean not null default true,
  display_order integer not null check (display_order > 0),
  created_at timestamptz not null default now(),
  constraint games_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.results (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete restrict,
  game_id uuid not null references public.games(id) on delete restrict,
  game_date date not null,
  score integer not null check (score >= 0),
  details jsonb not null default '{}'::jsonb,
  received_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint results_details_object check (jsonb_typeof(details) = 'object'),
  constraint results_player_game_date_key unique (player_id, game_id, game_date)
);

create index results_player_date_idx on public.results (player_id, game_date desc);
create index results_game_date_idx on public.results (game_id, game_date desc);
create index results_date_idx on public.results (game_date desc);

create table private.player_identifiers (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  phone_e164 text not null unique,
  created_at timestamptz not null default now(),
  constraint player_identifiers_phone_format check (phone_e164 ~ '^\+[1-9][0-9]{7,14}$')
);

create index player_identifiers_player_idx on private.player_identifiers (player_id);

create table private.ingest_events (
  id uuid primary key,
  sender_raw text not null,
  game_raw text not null,
  raw_message text not null,
  received_at timestamptz not null,
  parser_version text not null default '1',
  status text not null default 'pending',
  error_code text,
  result_id uuid references public.results(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ingest_events_status_check check (
    status in (
      'pending',
      'accepted',
      'duplicate_ignored',
      'unknown_sender',
      'unknown_game',
      'parse_failed'
    )
  )
);

create index ingest_events_status_idx on private.ingest_events (status, created_at);
create index ingest_events_result_idx on private.ingest_events (result_id);

insert into public.games (
  id,
  slug,
  display_name,
  max_score,
  higher_is_better,
  display_order
)
values
  ('00000000-0000-4000-8000-000000000101', 'maptap', 'MapTap', 1000, true, 1),
  ('00000000-0000-4000-8000-000000000102', 'pricepoint', 'PricePoint', null, true, 2),
  ('00000000-0000-4000-8000-000000000103', 'geoevents', 'GeoEvents', 1000, true, 3),
  ('00000000-0000-4000-8000-000000000104', 'geohistory', 'GeoHistory', 1000, true, 4)
on conflict (slug) do update set
  display_name = excluded.display_name,
  max_score = excluded.max_score,
  higher_is_better = excluded.higher_is_better,
  display_order = excluded.display_order;

alter table public.players enable row level security;
alter table public.games enable row level security;
alter table public.results enable row level security;
alter table private.player_identifiers enable row level security;
alter table private.ingest_events enable row level security;

revoke all on public.players, public.games, public.results from anon, authenticated;
grant select on public.players, public.games, public.results to anon, authenticated;

create policy "Public players are readable"
on public.players for select
to anon, authenticated
using (true);

create policy "Games are publicly readable"
on public.games for select
to anon, authenticated
using (true);

create policy "Results are publicly readable"
on public.results for select
to anon, authenticated
using (true);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'results'
  ) then
    alter publication supabase_realtime add table public.results;
  end if;
end
$$;
