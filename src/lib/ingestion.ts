import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import type { GameSlug, ParsedResult } from "@/lib/domain";
import { getSql } from "@/lib/db";
import { normalizeGameSlug } from "@/lib/games";
import { ParseError, parseResult } from "@/lib/parsers";

export const ingestRequestSchema = z.object({
  eventId: z.uuid(),
  sender: z.string().trim().min(8).max(40),
  game: z.string().trim().min(2).max(40),
  message: z.string().min(1).max(20_000),
  receivedAt: z.iso.datetime({ offset: true }),
});

export type IngestRequest = z.infer<typeof ingestRequestSchema>;

export type IngestOutcome = {
  ok: boolean;
  status:
    | "accepted"
    | "duplicate_ignored"
    | "unknown_sender"
    | "unknown_game"
    | "parse_failed"
    | "event_id_conflict";
  result?: {
    id: string;
    game: GameSlug;
    date: string;
    score: number;
  };
  error?: string;
};

export function secretsMatch(actualHeader: string | null, expected: string): boolean {
  const prefix = "Bearer ";
  if (!actualHeader?.startsWith(prefix) || expected.length < 32) return false;
  const actual = Buffer.from(actualHeader.slice(prefix.length));
  const wanted = Buffer.from(expected);
  return actual.length === wanted.length && timingSafeEqual(actual, wanted);
}

export function normalizePhoneNumber(value: string): string | null {
  const hasPlus = value.trim().startsWith("+");
  let digits = value.replace(/\D/g, "");
  if (!hasPlus && digits.length === 10) digits = `1${digits}`;
  if (digits.length < 8 || digits.length > 15 || digits.startsWith("0")) return null;
  return `+${digits}`;
}

type ExistingEvent = {
  sender_raw: string;
  game_raw: string;
  raw_message: string;
  received_at: Date | string;
  status: IngestOutcome["status"] | "pending";
  result_id: string | null;
};

function sameInstant(value: Date | string, expected: string): boolean {
  return new Date(value).getTime() === new Date(expected).getTime();
}

export async function ingestScore(input: IngestRequest): Promise<IngestOutcome> {
  const sql = getSql();
  const gameSlug = normalizeGameSlug(input.game);
  const phone = normalizePhoneNumber(input.sender);
  const timeZone = process.env.APP_TIMEZONE || "America/Chicago";
  let parsed: ParsedResult | null = null;
  let parseError: ParseError | null = null;

  if (gameSlug) {
    try {
      parsed = parseResult(gameSlug, input.message, new Date(input.receivedAt), timeZone);
    } catch (error) {
      parseError =
        error instanceof ParseError
          ? error
          : new ParseError("PARSE_FAILED", "The result could not be parsed.");
    }
  }

  return sql.begin(async (transaction) => {
    await transaction`
      insert into private.ingest_events (
        id, sender_raw, game_raw, raw_message, received_at
      )
      values (
        ${input.eventId}::uuid,
        ${input.sender},
        ${input.game},
        ${input.message},
        ${input.receivedAt}::timestamptz
      )
      on conflict (id) do nothing
    `;

    const rows = await transaction<ExistingEvent[]>`
      select sender_raw, game_raw, raw_message, received_at, status, result_id
      from private.ingest_events
      where id = ${input.eventId}::uuid
      for update
    `;
    const event = rows[0];
    if (
      event.sender_raw !== input.sender ||
      event.game_raw !== input.game ||
      event.raw_message !== input.message ||
      !sameInstant(event.received_at, input.receivedAt)
    ) {
      return {
        ok: false,
        status: "event_id_conflict",
        error: "This event ID was already used for a different payload.",
      };
    }

    if (event.status === "accepted" || event.status === "duplicate_ignored") {
      return { ok: true, status: event.status };
    }

    if (!gameSlug) {
      await transaction`
        update private.ingest_events
        set status = 'unknown_game', error_code = 'UNKNOWN_GAME', updated_at = now()
        where id = ${input.eventId}::uuid
      `;
      return { ok: false, status: "unknown_game", error: "Unknown game." };
    }

    if (parseError || !parsed) {
      const errorCode = parseError?.code ?? "PARSE_FAILED";
      await transaction`
        update private.ingest_events
        set status = 'parse_failed', error_code = ${errorCode}, updated_at = now()
        where id = ${input.eventId}::uuid
      `;
      return { ok: false, status: "parse_failed", error: errorCode };
    }

    const playerRows = phone
      ? await transaction<{ player_id: string }[]>`
          select player_id
          from private.player_identifiers
          where phone_e164 = ${phone}
        `
      : [];
    if (!playerRows[0]) {
      await transaction`
        update private.ingest_events
        set status = 'unknown_sender', error_code = 'UNKNOWN_SENDER', updated_at = now()
        where id = ${input.eventId}::uuid
      `;
      return { ok: false, status: "unknown_sender", error: "Unknown sender." };
    }

    const gameRows = await transaction<{ id: string }[]>`
      select id from public.games where slug = ${gameSlug}
    `;
    const gameId = gameRows[0]?.id;
    if (!gameId) {
      await transaction`
        update private.ingest_events
        set status = 'unknown_game', error_code = 'GAME_NOT_CONFIGURED', updated_at = now()
        where id = ${input.eventId}::uuid
      `;
      return { ok: false, status: "unknown_game", error: "Game is not configured." };
    }

    const inserted = await transaction<{ id: string }[]>`
      insert into public.results (
        player_id, game_id, game_date, score, details, received_at
      )
      values (
        ${playerRows[0].player_id}::uuid,
        ${gameId}::uuid,
        ${parsed.gameDate}::date,
        ${parsed.score},
        ${JSON.stringify(parsed.details)}::jsonb,
        ${input.receivedAt}::timestamptz
      )
      on conflict (player_id, game_id, game_date) do nothing
      returning id
    `;

    const status = inserted[0] ? "accepted" : "duplicate_ignored";
    const resultId =
      inserted[0]?.id ??
      (
        await transaction<{ id: string }[]>`
          select id
          from public.results
          where player_id = ${playerRows[0].player_id}::uuid
            and game_id = ${gameId}::uuid
            and game_date = ${parsed.gameDate}::date
        `
      )[0].id;

    await transaction`
      update private.ingest_events
      set status = ${status}, error_code = null, result_id = ${resultId}::uuid, updated_at = now()
      where id = ${input.eventId}::uuid
    `;

    return {
      ok: true,
      status,
      result: {
        id: resultId,
        game: gameSlug,
        date: parsed.gameDate,
        score: parsed.score,
      },
    };
  });
}
