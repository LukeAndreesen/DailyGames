# Daily Games Scoreboard

A mobile-first live scoreboard for MapTap, PricePoint, GeoEvents, and GeoHistory results shared through an iMessage group.

## The important architecture decision

Do **not** point the iPhone Shortcuts directly at this Next.js application.

```text
iPhone Shortcut
  → existing Google Apps Script web-app URL
      ├─→ Google Sheet raw audit log
      └─→ this app's /api/ingest endpoint
            → Supabase
            → live website
```

Only Google Apps Script is updated. The iPhone automations keep their current URL and payload:

```json
{
  "sender": "+13125551234",
  "game": "GeoHistory",
  "message": "GeoHistory · August 16th\n868 / 1,000\n..."
}
```

## What is already implemented

- Four tested share-message parsers, including appended-comment handling.
- First-valid-score-wins idempotent ingestion.
- Average-placement scoring with split ties, ignored missing games, and excluded solo placement.
- Daily, all-time, game, and player views.
- Supabase RLS and a private schema for phones/raw messages.
- Supabase Realtime refresh plus mobile Safari focus recovery.
- Google Apps Script audit, forwarding, and retry relay.
- Player seed and historical CSV import scripts.
- Demo data when Supabase is not configured.

## Run the demo locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without `.env.local`, the app intentionally displays fictional demo data.

## External setup checklist

### 1. Create accounts

Create:

1. A GitHub account and private repository.
2. A free Supabase project.
3. A free Vercel account connected to GitHub.

### 2. Configure Supabase locally

Copy the environment template:

```bash
cp .env.example .env.local
```

Fill in:

```text
NEXT_PUBLIC_SUPABASE_URL        Supabase project URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  Supabase publishable key
DATABASE_URL                    Supabase transaction-pooler connection string
INGEST_SECRET                   A random secret of at least 32 characters
APP_TIMEZONE                    America/Chicago
NEXT_PUBLIC_SITE_URL            http://localhost:3000 initially
```

`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is designed for browser use and is protected by RLS. `DATABASE_URL` and `INGEST_SECRET` are server-only and must never be committed.

Generate an ingestion secret with:

```bash
openssl rand -hex 32
```

Then authenticate and apply the migration:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

### 3. Add the seven players privately

Copy:

```bash
cp config/players.example.json config/players.local.json
```

Replace the examples with all seven names and E.164 phone numbers, in the desired display order:

```json
[
  { "displayName": "Luke", "phone": "+13125551234" },
  { "displayName": "Friend", "phone": "+13125551235" }
]
```

Run:

```bash
npm run seed:players
```

The local mapping file is gitignored. Phone numbers go only into `private.player_identifiers`.

### 4. Test locally against Supabase

```bash
npm run dev
```

Confirm the yellow demo banner is gone. To test ingestion, POST a real share with the same `INGEST_SECRET` using an event UUID and mapped phone number.

### 5. Push to GitHub and deploy on Vercel

Push this repository to the private GitHub repository, then import it from the Vercel dashboard.

Add every variable from `.env.example` to Vercel. Set `NEXT_PUBLIC_SITE_URL` to the production `https://…vercel.app` URL. Use the same `INGEST_SECRET` locally, in Vercel, and in Apps Script.

After deployment, verify:

```text
https://YOUR-PROJECT.vercel.app
https://YOUR-PROJECT.vercel.app/api/ingest
```

The ingestion route accepts `POST` only; opening it in a browser is not a functional test.

### 6. Update Google Apps Script—not the iPhone Shortcuts

Follow [`apps-script/README.md`](apps-script/README.md):

1. Copy `apps-script/Code.gs` into the existing Sheet-bound Apps Script project.
2. Add Script Properties for `SHEET_NAME`, `INGEST_URL`, and `INGEST_SECRET`.
3. Run `setupScoreboardSheet` once.
4. Redeploy the web app as a new version.
5. Add a 15-minute trigger for `retryFailedRows`.
6. Leave every iPhone Shortcut pointed at the existing Apps Script `/exec` URL.

### 7. Import old Sheet rows, if desired

Export the existing historical tab as CSV. The importer recognizes common headers:

```text
Timestamp / Received At
Sender
Game
Raw Message / Message / Content
Event ID (optional)
```

Run:

```bash
npm run import:sheet -- /absolute/path/to/scores.csv
```

Rows are processed chronologically so the first valid score for each player/game/date remains authoritative.

## Quality commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run check
```

## Privacy model

- Public browser access: player display names, games, normalized results, statistics.
- Private database access: phone mappings and raw iMessage content.
- Google Sheet: raw audit/recovery copy, accessible only through your Google account sharing settings.
- Browser code never receives `DATABASE_URL`, `INGEST_SECRET`, phone numbers, or raw message text.
