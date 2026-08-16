import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import dotenv from "dotenv";
import { parse } from "csv-parse/sync";
import { ingestScore } from "../src/lib/ingestion";

dotenv.config({ path: ".env.local" });

type CsvRow = Record<string, string>;

function find(row: CsvRow, aliases: string[]): string {
  const entry = Object.entries(row).find(([key]) =>
    aliases.includes(key.trim().toLowerCase()),
  );
  return entry?.[1]?.trim() ?? "";
}

function stableUuid(value: string): string {
  const bytes = createHash("sha256").update(value).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing from .env.local");
const csvPath = resolve(process.argv[2] || "scores.csv");
const rows = parse(await readFile(csvPath, "utf8"), {
  columns: true,
  skip_empty_lines: true,
  relax_column_count: true,
}) as CsvRow[];

const events = rows
  .flatMap((row, index) => {
    const sender = find(row, ["sender", "phone", "from"]);
    const game = find(row, ["game", "game name"]);
    const message = find(row, ["raw message", "message", "content"]);
    const receivedValue = find(row, ["received at", "timestamp", "date"]);
    const received = new Date(receivedValue);
    if (!sender || !game || !message || !Number.isFinite(received.getTime())) return [];
    const existingId = find(row, ["event id", "eventid"]);
    return [{
      eventId:
        existingId ||
        stableUuid(`${index}|${receivedValue}|${sender}|${game}|${message}`),
      sender,
      game,
      message,
      receivedAt: received.toISOString(),
      sortTime: received.getTime(),
    }];
  })
  .sort((a, b) => a.sortTime - b.sortTime);

const counts: Record<string, number> = {};
for (const event of events) {
  const outcome = await ingestScore({
    eventId: event.eventId,
    sender: event.sender,
    game: event.game,
    message: event.message,
    receivedAt: event.receivedAt,
  });
  counts[outcome.status] = (counts[outcome.status] ?? 0) + 1;
}

console.log(`Processed ${events.length} historical rows from ${csvPath}`);
console.table(counts);
