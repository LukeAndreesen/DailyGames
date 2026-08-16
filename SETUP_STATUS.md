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
- [x] Run live ingestion through Apps Script and verify normalized Supabase results.
- [ ] Confirm an already-open browser updates through Supabase Realtime without a manual refresh.

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

- [x] Set `INGEST_URL` to `https://daily-games-m11g.vercel.app/api/ingest` in Apps Script Properties.
- [x] Set `INGEST_SECRET` in Apps Script Properties to match Vercel.
- [x] Confirm `SHEET_NAME` matches the `Score Events` raw audit tab.
- [x] Keep `SCOREBOARD_DATA_MODE=preview` during pre-launch review.
- [x] Start the live audit tab without mock rows.
- [x] Confirm `public.results` and `private.ingest_events` were empty before launch.
- [x] Set `SCOREBOARD_DATA_MODE=live` in Vercel Production and redeploy.
- [x] Redeploy the existing Apps Script web app as a new version without changing its public `/exec` URL.
- [x] Run `setupScoreboardSheet` once to create the audit/status columns.
- [x] Add a 15-minute time-driven trigger for `retryFailedRows`.
- [x] Send real supported MapTap results through iMessage.
- [x] Confirm two Sheet rows were forwarded, Supabase stored exactly two normalized results, and both website pages render them.

## Optional after launch

- [ ] Import historical Google Sheet rows with `npm run import:sheet -- /absolute/path/to/scores.csv`.
- [ ] Add nightly iMessage/Sheet reconciliation.
