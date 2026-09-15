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
- [x] Neon-backed Vercel Preview rendered the migrated live scoreboard and leaderboard.
- [x] Preview `/api/ingest` accepted a synthetic event and wrote it only to Neon.
- [x] Synthetic Neon result and ingest-event records removed after verification.
- [x] Source and target counts rechecked immediately before cutover with no intervening writes.
- [x] Vercel Preview and Production `DATABASE_URL` values switched to the Neon pooled URL.
- [x] Neon-backed production deployment verified at `https://daily-games-m11g.vercel.app`.
- [x] Temporary migration credential and migration-only Preview deployments removed.

## Remaining follow-up

- [ ] Verify the next real Apps Script event appears on the Neon-backed production site.
- [ ] Merge the pushed `neon-migration` branch into `main` after reconciling the unavailable iCloud checkout.
- [ ] Remove obsolete `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` variables from Vercel.

## Rollback and cleanup

- Keep the Supabase project intact until the Neon production deployment and real ingestion flow are verified.
- Roll back by restoring Vercel's previous Supabase `DATABASE_URL` and redeploying.
- The legacy `supabase/` folder remains in Git as migration history during the rollback window.
- Delete the Supabase project only after the owner is satisfied with the Neon-backed production app.
