# DailyGames setup status

Last updated: September 15, 2026

This file tracks external setup only. Never add phone numbers, database passwords, API secrets, or private keys here.

## Complete

- [x] Application implemented and deployed at `https://daily-games-m11g.vercel.app`.
- [x] Git repository connected to `LukeAndreesen/DailyGames`.
- [x] Google Apps Script relay and iPhone Shortcuts left on their existing public URL.
- [x] Neon CLI authenticated and this workspace linked to the Neon `DailyGames` project.
- [x] Neon production schema created from `neon/migrations/0001_initial.sql`.
- [x] Supabase data copied to Neon: players, games, results, private phone mappings, and ingest audit events.
- [x] Neon row counts and referential integrity verified after the copy.
- [x] Runtime Supabase Realtime dependency replaced with periodic and focus-based refresh.

## Remaining cutover work

- [ ] Deploy the Neon-backed code as a protected Vercel preview.
- [ ] Verify the preview renders live scoreboard data from Neon.
- [ ] Send a synthetic ingestion request to the preview and verify it writes only to Neon.
- [ ] Remove that synthetic result and ingest event from Neon.
- [ ] Re-run the data copy immediately before production cutover to capture any intervening Supabase writes.
- [ ] Replace Vercel Production and Preview `DATABASE_URL` with the Neon pooled URL.
- [ ] Deploy production and verify the website plus the Apps Script ingestion path.
- [ ] Remove obsolete `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` variables from Vercel.
- [ ] Remove the temporary Preview-only `NEON_DATABASE_URL` migration variable.

## Rollback and cleanup

- Keep the Supabase project intact until the Neon production deployment and real ingestion flow are verified.
- Roll back by restoring Vercel's previous Supabase `DATABASE_URL` and redeploying.
- The legacy `supabase/` folder remains in Git as migration history during the rollback window.
- Delete the Supabase project only after the owner is satisfied with the Neon-backed production app.
