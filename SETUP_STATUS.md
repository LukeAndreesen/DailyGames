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

## Next: Supabase

- [ ] Apply `supabase/migrations/20260816214043_initial_scoreboard_schema.sql` to the project.
- [ ] Seed the seven players and their private phone mappings.
- [ ] Add the Supabase publishable key to local `.env.local` and Vercel.
- [ ] Add the Supabase transaction-pooler `DATABASE_URL` to local `.env.local` and Vercel.
- [ ] Run a live database/privacy/realtime verification.

## Next: Vercel

- [ ] Import `LukeAndreesen/DailyGames` from GitHub with the repository root as the Root Directory.
- [ ] Add all production environment variables listed in `.env.example`.
- [ ] Generate one random `INGEST_SECRET` and use the exact same value in Vercel and Apps Script.
- [ ] Deploy and record the production URL.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to that production URL and redeploy if necessary.

## Next: Apps Script and end-to-end test

- [ ] Set `INGEST_URL` to `https://<production-domain>/api/ingest` in Apps Script Properties.
- [ ] Set `INGEST_SECRET` in Apps Script Properties to match Vercel.
- [ ] Confirm `SHEET_NAME` matches the raw audit tab.
- [ ] Redeploy the existing Apps Script web app as a new version without changing its public `/exec` URL.
- [ ] Run `setupScoreboardSheet` once if the audit/status columns are not already present.
- [ ] Add a 15-minute time-driven trigger for `retryFailedRows`.
- [ ] Send one real supported game result through iMessage.
- [ ] Confirm the Sheet row is saved, Supabase receives one normalized result, and the open website updates live.

## Optional after launch

- [ ] Import historical Google Sheet rows with `npm run import:sheet -- /absolute/path/to/scores.csv`.
- [ ] Add nightly iMessage/Sheet reconciliation.
