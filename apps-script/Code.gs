const SCORE_HEADERS = [
  "Event ID",
  "Received At",
  "Sender",
  "Game",
  "Raw Message",
  "Forward Status",
  "HTTP Status",
  "Forwarded At",
  "Error",
];

/**
 * Keep every iPhone Shortcut pointed at this Apps Script web app.
 * This function writes the raw event to Sheets first, then forwards it to Vercel.
 */
function doPost(e) {
  try {
    const incoming = JSON.parse(e.postData.contents);
    validateIncoming_(incoming);

    const event = {
      eventId: Utilities.getUuid(),
      sender: String(incoming.sender),
      game: String(incoming.game),
      message: String(incoming.message),
      receivedAt: new Date().toISOString(),
    };

    appendEvent_(event);
    const outcome = forwardEvent_(event);
    updateEventStatus_(event.eventId, outcome);

    return jsonResponse_({
      ok: true,
      saved: true,
      forwarded: outcome.status === "forwarded",
      eventId: event.eventId,
    });
  } catch (error) {
    console.error(error);
    return jsonResponse_({ ok: false, error: String(error.message || error) });
  }
}

/** Run once from the Apps Script editor before deploying. */
function setupScoreboardSheet() {
  getScoreSheet_();
}

/**
 * Add a time-driven trigger for this function every 15 minutes.
 * It retries only temporary delivery failures, using the original event ID.
 */
function retryFailedRows() {
  const sheet = getScoreSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  const rows = sheet.getRange(2, 1, lastRow - 1, SCORE_HEADERS.length).getValues();
  let attempted = 0;
  rows.forEach((row) => {
    if (attempted >= 25 || row[5] !== "retry") return;
    attempted += 1;
    const event = {
      eventId: String(row[0]),
      receivedAt: new Date(row[1]).toISOString(),
      sender: String(row[2]),
      game: String(row[3]),
      message: String(row[4]),
    };
    const outcome = forwardEvent_(event);
    updateEventStatus_(event.eventId, outcome);
  });
}

function validateIncoming_(incoming) {
  if (!incoming || typeof incoming !== "object") throw new Error("JSON object required");
  ["sender", "game", "message"].forEach((key) => {
    if (!incoming[key] || typeof incoming[key] !== "string") {
      throw new Error("Missing string field: " + key);
    }
  });
}

function getScoreSheet_() {
  const properties = PropertiesService.getScriptProperties();
  const sheetName = properties.getProperty("SHEET_NAME") || "Score Events";
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) sheet = spreadsheet.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(SCORE_HEADERS);
    sheet.setFrozenRows(1);
  } else {
    const headers = sheet.getRange(1, 1, 1, SCORE_HEADERS.length).getValues()[0];
    if (headers.join("|") !== SCORE_HEADERS.join("|")) {
      throw new Error(
        'The "' + sheetName + '" tab has unexpected headers. Use a new empty tab or the documented headers.',
      );
    }
  }
  return sheet;
}

function appendEvent_(event) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    getScoreSheet_().appendRow([
      event.eventId,
      event.receivedAt,
      event.sender,
      event.game,
      event.message,
      "pending",
      "",
      "",
      "",
    ]);
  } finally {
    lock.releaseLock();
  }
}

function forwardEvent_(event) {
  const properties = PropertiesService.getScriptProperties();
  const url = properties.getProperty("INGEST_URL");
  const secret = properties.getProperty("INGEST_SECRET");
  if (!url || !secret) {
    return { status: "retry", httpStatus: "", error: "INGEST_URL or INGEST_SECRET is missing" };
  }

  try {
    const response = UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      headers: { Authorization: "Bearer " + secret },
      payload: JSON.stringify(event),
      muteHttpExceptions: true,
    });
    const code = response.getResponseCode();
    if (code >= 200 && code < 300) {
      return { status: "forwarded", httpStatus: code, error: "" };
    }
    if (code >= 500 || code === 408 || code === 429) {
      return { status: "retry", httpStatus: code, error: response.getContentText() };
    }
    return { status: "needs_review", httpStatus: code, error: response.getContentText() };
  } catch (error) {
    return { status: "retry", httpStatus: "", error: String(error.message || error) };
  }
}

function updateEventStatus_(eventId, outcome) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getScoreSheet_();
    const match = sheet
      .getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 1)
      .createTextFinder(eventId)
      .matchEntireCell(true)
      .findNext();
    if (!match) throw new Error("Could not locate event row: " + eventId);
    sheet.getRange(match.getRow(), 6, 1, 4).setValues([
      [
        outcome.status,
        outcome.httpStatus,
        new Date().toISOString(),
        String(outcome.error || "").slice(0, 5000),
      ],
    ]);
  } finally {
    lock.releaseLock();
  }
}

function jsonResponse_(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
