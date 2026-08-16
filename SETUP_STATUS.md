# DailyGames setup status

Last updated: August 16, 2026

This file tracks external setup only. Never add phone numbers, database passwords, API secrets, or private keys here.

## Complete

- [x] Application implemented and verified locally.
- [x] Git repository connected to `git@github.com:LukeAndreesen/DailyGames.git`.
- [x] Initial application pushed to GitHub `main`.
- [x] Supabase project created: `tbfjzpittidtwfbxavnj`.
- [x] Supabase project URL saved in the ignored local `.env.local` file.
- [x] Seven player names and phone mappings saved in ignored `config/players.local.json`.
- [x] Google Apps Script relay code updated by the owner.
- [x] iPhone Shortcuts left unchanged and still pointed at Google Apps Script.
- [x] Project-scoped Codex MCP entry named `supabase-dailygames` configured.
- [x] Supabase MCP OAuth authorization completed for `supabase-dailygames`.
- [x] Supabase agent skill available in Codex.
- [x] Vercel CLI authenticated as `luke-2256` with access to the `luke-andreesens-projects` team.
- [x] Vercel MCP OAuth authorization completed.
- [x] Vercel agent plugin installed in Codex.

## Next: Supabase

- [x] Apply `supabase/migrations/20260816225618_initial_scoreboard_schema.sql` to the project.
- [x] Seed the seven players and their private phone mappings.
- [x] Add the Supabase publishable key to local `.env.local`.
- [x] Add and verify the Supabase transaction-pooler `DATABASE_URL` in local `.env.local`.
- [x] Verify table counts, RLS, Realtime publication, and the public/private API boundary.
- [x] Add the Supabase URL and publishable key to Vercel.
- [x] Add the Supabase transaction-pooler `DATABASE_URL` to Vercel Production and Preview as a sensitive variable.
- [ ] Run a live ingestion and browser Realtime verification.

## Next: Vercel

- [x] Import `LukeAndreesen/DailyGames` from GitHub with the repository root as the Root Directory.
- [x] Confirm the Git-linked `daily-games-m11g` preview deployment builds successfully.
- [x] Resolve the Vercel CLI account mismatch and link the local repository to `daily-games-m11g` under `luke-2256`.
- [ ] Decide whether to remove the separate misconfigured `daily-games` project after confirming it is unused.
- [x] Add all production environment variables listed in `.env.example`.
- [x] Generate a random 64-character `INGEST_SECRET`, save it in Vercel as sensitive, and copy it to the owner's clipboard for Apps Script.
- [x] Deploy production at `https://daily-games-m11g.vercel.app`.
- [x] Set `NEXT_PUBLIC_SITE_URL` to the production URL and redeploy.

## Next: Apps Script and end-to-end test

- [ ] Set `INGEST_URL` to `https://<production-domain>/api/ingest` in Apps Script Properties.
- [ ] Set `INGEST_SECRET` in Apps Script Properties to match Vercel.
- [ ] Confirm `SHEET_NAME` matches the raw audit tab.
- [ ] Keep `SCOREBOARD_DATA_MODE=preview` during pre-launch review.
- [ ] Clear all existing mock Sheet rows immediately before launch; do not import them.
- [ ] Confirm `public.results` and `private.ingest_events` are still empty.
- [ ] Set `SCOREBOARD_DATA_MODE=live` in Vercel Production and redeploy.
- [ ] Redeploy the existing Apps Script web app as a new version without changing its public `/exec` URL.
- [ ] Run `setupScoreboardSheet` once if the audit/status columns are not already present.
- [ ] Add a 15-minute time-driven trigger for `retryFailedRows`.
- [ ] Send one real supported game result through iMessage.
- [ ] Confirm the Sheet row is saved, Supabase receives one normalized result, and the open website updates live.

## Optional after launch

- [ ] Import historical Google Sheet rows with `npm run import:sheet -- /absolute/path/to/scores.csv`.
- [ ] Add nightly iMessage/Sheet reconciliation.
