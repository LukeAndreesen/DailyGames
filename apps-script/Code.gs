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

    const stored = getOrCreateEvent_(incoming);
    let outcome;
    if (stored.status === "forwarded") {
      outcome = { status: "forwarded", httpStatus: stored.httpStatus || 200, error: "" };
    } else if (stored.status === "needs_review") {
      outcome = {
        status: "needs_review",
        httpStatus: stored.httpStatus || "",
        error: stored.error || "This event needs review before it can be retried.",
      };
    } else {
      outcome = forwardEvent_(stored.event);
      updateEventStatus_(stored.event.eventId, outcome);
    }

    return jsonResponse_({
      ok: true,
      saved: true,
      forwarded: outcome.status === "forwarded",
      duplicate: stored.existed,
      eventId: stored.event.eventId,
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
  if (incoming.receivedAt && isNaN(new Date(incoming.receivedAt).getTime())) {
    throw new Error("receivedAt must be a valid date when provided");
  }
}

function canonicalSender_(value) {
  return String(value).replace(/\D/g, "");
}

function canonicalGame_(value) {
  const key = String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
  return key === "maptag" ? "maptap" : key;
}

function canonicalMessage_(value) {
  return String(value).replace(/\r\n?/g, "\n").trim();
}

function samePayload_(row, incoming) {
  return (
    canonicalSender_(row[2]) === canonicalSender_(incoming.sender) &&
    canonicalGame_(row[3]) === canonicalGame_(incoming.game) &&
    canonicalMessage_(row[4]) === canonicalMessage_(incoming.message)
  );
}

function deterministicEventId_(incoming) {
  const fingerprint = [
    canonicalSender_(incoming.sender),
    canonicalGame_(incoming.game),
    canonicalMessage_(incoming.message),
  ].join("\u001f");
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    fingerprint,
    Utilities.Charset.UTF_8,
  );
  const hex = bytes
    .map((byte) => (byte < 0 ? byte + 256 : byte).toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32)
    .split("");

  // RFC 9562 version 8 UUID: application-defined deterministic payload.
  hex[12] = "8";
  hex[16] = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  return [
    hex.slice(0, 8).join(""),
    hex.slice(8, 12).join(""),
    hex.slice(12, 16).join(""),
    hex.slice(16, 20).join(""),
    hex.slice(20, 32).join(""),
  ].join("-");
}

function receivedAt_(value) {
  return value ? new Date(value).toISOString() : new Date().toISOString();
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

function getOrCreateEvent_(incoming) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getScoreSheet_();
    const lastRow = sheet.getLastRow();
    if (lastRow >= 2) {
      const rows = sheet.getRange(2, 1, lastRow - 1, SCORE_HEADERS.length).getValues();
      const existing = rows.find((row) => samePayload_(row, incoming));
      if (existing) {
        return {
          existed: true,
          status: String(existing[5] || "pending"),
          httpStatus: existing[6],
          error: String(existing[8] || ""),
          event: {
            eventId: String(existing[0]),
            receivedAt: new Date(existing[1]).toISOString(),
            sender: String(existing[2]),
            game: String(existing[3]),
            message: String(existing[4]),
          },
        };
      }
    }

    const event = {
      eventId: deterministicEventId_(incoming),
      receivedAt: receivedAt_(incoming.receivedAt),
      sender: String(incoming.sender),
      game: String(incoming.game),
      message: canonicalMessage_(incoming.message),
    };
    sheet.appendRow([
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
    return {
      existed: false,
      status: "pending",
      httpStatus: "",
      error: "",
      event,
    };
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
