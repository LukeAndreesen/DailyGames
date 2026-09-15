# Daily Games Scoreboard

A mobile-first scoreboard for MapTap, PricePoint, GeoEvents, GeoHistory, GeoSports, and other daily games shared through an iMessage group.

## Architecture

Do **not** point the iPhone Shortcuts directly at this Next.js application.

```text
iPhone Shortcut
  → existing Google Apps Script web-app URL
      ├─→ Google Sheet raw audit log
      └─→ this app's /api/ingest endpoint
            → Neon Postgres
            → live website
```

Only Google Apps Script is updated. The iPhone automations keep their existing URL and payload.

The browser never connects to the database. Next.js Server Components and the ingestion route use the server-only pooled `DATABASE_URL`. Live pages refresh from Neon every 15 seconds and whenever mobile Safari regains focus.

## What is implemented

- Tested share-message parsers with appended-comment handling.
- First-valid-score-wins, idempotent ingestion.
- Normalized 0–100 rank points with split ties, ignored missing games, and excluded solo placement.
- Multiplayer Elo ratings plus daily, trailing-week, and all-time awards.
- Daily, all-time, game, and player views.
- A private PostgreSQL schema for phone mappings and raw messages.
- Google Apps Script auditing, forwarding, and retry relay.
- Player seeding and historical CSV import scripts.
- A safe preview mode that generates synthetic scores in memory.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Preview is the default: the app uses configured player and game records when available, generates seven days of synthetic scores in memory, and never writes those scores to Neon.

## Configure Neon

Authenticate and link this directory to the Neon project:

```bash
npx neon@latest auth
npx neon@latest link
npx neon@latest env pull --service postgres --file .env.local
```

The application uses the pooled `DATABASE_URL`. Schema migrations and database export/import operations must use the direct `DATABASE_URL_UNPOOLED` connection.

For a new empty database, apply the committed schema through Neon's direct connection:

```bash
npx neon@latest psql production -- \
  -X -v ON_ERROR_STOP=1 -f neon/migrations/0001_initial.sql
```

`DATABASE_URL`, `DATABASE_URL_UNPOOLED`, and `INGEST_SECRET` are server-only and must never be committed or prefixed with `NEXT_PUBLIC_`.

## Add players privately

Copy the example configuration:

```bash
cp config/players.example.json config/players.local.json
```

Replace the examples with names and E.164 phone numbers in display order, then run:

```bash
npm run seed:players
```

The mapping file is gitignored. Phone numbers are stored only in `private.player_identifiers`.

## Deploy on Vercel

Configure these variables for Production and Preview as appropriate:

```text
DATABASE_URL          Neon pooled connection URL
INGEST_SECRET         Same 64-character secret used by Google Apps Script
SCOREBOARD_DATA_MODE  preview or live
APP_TIMEZONE          America/Chicago
NEXT_PUBLIC_SITE_URL  Deployed site URL
```

Do not expose a database URL as a `NEXT_PUBLIC_` variable.

After deployment, verify the website and the `POST /api/ingest` flow. Opening `/api/ingest` in a browser is not a functional test because the route accepts `POST` only.

## Google Apps Script

Follow [`apps-script/README.md`](apps-script/README.md):

1. Keep the existing Sheet-bound Apps Script deployment and public `/exec` URL.
2. Keep `INGEST_URL` pointed at `https://daily-games-m11g.vercel.app/api/ingest`.
3. Keep `INGEST_SECRET` identical in Apps Script and Vercel.
4. Keep the 15-minute `retryFailedRows` trigger.

Neither the iPhone Shortcuts nor the Apps Script URL needs to change when the database provider changes.

## Import historical Sheet rows

Export the historical tab as CSV, then run:

```bash
npm run import:sheet -- /absolute/path/to/scores.csv
```

Rows are processed chronologically so the first valid score for each player, game, and date remains authoritative.

## Preview and live modes

Keep `SCOREBOARD_DATA_MODE=preview` while reviewing the UI. Immediately before a new launch, confirm the intended Neon tables and source Sheet are in the expected state, change the variable to `live`, and redeploy.

To return to a safe preview at any point, set `SCOREBOARD_DATA_MODE=preview` and redeploy. Preview scores are generated at request time, so there are no mock rows to remove from Neon.

## Quality commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run check
```

## Privacy model

- Public browser access: player display names, games, normalized results, and statistics rendered by Next.js.
- Private database access: phone mappings and raw iMessage content, available only to server-side code.
- Google Sheet: raw audit and recovery copy, governed by the Google account's sharing settings.
- Browser code never receives `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `INGEST_SECRET`, phone numbers, or raw message text.

The legacy `supabase/` folder is retained temporarily as rollback documentation until the old Supabase project is deliberately removed.
