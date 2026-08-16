# Google Apps Script relay

The iPhone Shortcuts continue posting to the existing Apps Script web-app URL. They do **not** post directly to Vercel.

## Setup

1. Replace the bound Apps Script project code with `Code.gs`.
2. In Apps Script **Project Settings → Script Properties**, add:
   - `SHEET_NAME`: `Score Events`
   - `INGEST_URL`: the deployed `https://…vercel.app/api/ingest` URL
   - `INGEST_SECRET`: the same 32+ character secret configured in Vercel
3. Run `setupScoreboardSheet` once and approve permissions.
4. Redeploy the Apps Script web app as a new version. Keep its existing `/exec` URL in the iPhone Shortcuts.
5. Add a time-driven trigger that runs `retryFailedRows` every 15 minutes.

The script creates a new `Score Events` tab, preserving any existing score tab and historical data.
