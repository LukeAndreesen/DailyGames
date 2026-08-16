import type { GameSlug, ParsedResult } from "@/lib/domain";
import { dateInTimeZone, parseSharedMonthDay } from "@/lib/date";

export class ParseError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ParseError";
  }
}

function normalizeMessage(message: string): string {
  return message.replace(/\r\n?/g, "\n").replace(/\u00a0/g, " ").trim();
}

function requiredDate(
  message: string,
  receivedAt: Date,
  timeZone: string,
): string {
  const date = parseSharedMonthDay(message, receivedAt, timeZone);
  if (!date) {
    throw new ParseError("DATE_NOT_FOUND", "The shared game date was not found.");
  }
  return date;
}

function parseMapTap(
  message: string,
  receivedAt: Date,
  timeZone: string,
): ParsedResult {
  if (!/(?:www\.)?maptap\.gg/i.test(message)) {
    throw new ParseError("GAME_MISMATCH", "The message is not a MapTap share.");
  }
  const score = message.match(/^\s*Final score:\s*([\d,]+)\s*$/im);
  if (!score) throw new ParseError("SCORE_NOT_FOUND", "MapTap final score not found.");
  return {
    gameDate: requiredDate(message, receivedAt, timeZone),
    score: Number(score[1].replaceAll(",", "")),
    details: {},
  };
}

function parsePricePoint(
  message: string,
  receivedAt: Date,
  timeZone: string,
): ParsedResult {
  const puzzle = message.match(/\bPricePoint\s*#(\d+)\b/i);
  if (!puzzle && !/(?:www\.)?pricepoint\.gg/i.test(message)) {
    throw new ParseError("GAME_MISMATCH", "The message is not a PricePoint share.");
  }
  const score = message.match(/\bI got\s+([\d,]+)\s+points\b/i);
  if (!score) {
    throw new ParseError("SCORE_NOT_FOUND", "PricePoint points were not found.");
  }
  return {
    gameDate: dateInTimeZone(receivedAt, timeZone),
    score: Number(score[1].replaceAll(",", "")),
    details: puzzle ? { puzzleNumber: Number(puzzle[1]) } : {},
  };
}

function parseGeoEvents(
  message: string,
  receivedAt: Date,
  timeZone: string,
): ParsedResult {
  if (!/\bGeoEvents\b|(?:www\.)?geoevents\.app/i.test(message)) {
    throw new ParseError("GAME_MISMATCH", "The message is not a GeoEvents share.");
  }
  const score = message.match(/^\s*([\d,]+)\s*\/\s*1,?000\s*$/im);
  if (!score) {
    throw new ParseError("SCORE_NOT_FOUND", "GeoEvents score was not found.");
  }
  const distance = message.match(/Avg Distance:\s*([\d,]+)\s*miles?/i);
  return {
    gameDate: requiredDate(message, receivedAt, timeZone),
    score: Number(score[1].replaceAll(",", "")),
    details: distance
      ? { averageDistanceMiles: Number(distance[1].replaceAll(",", "")) }
      : {},
  };
}

function parseGeoHistory(
  message: string,
  receivedAt: Date,
  timeZone: string,
): ParsedResult {
  if (!/\bGeoHistory\b|(?:www\.)?geohistory\.gg/i.test(message)) {
    throw new ParseError("GAME_MISMATCH", "The message is not a GeoHistory share.");
  }
  const score = message.match(/^\s*([\d,]+)\s*\/\s*1,?000\s*$/im);
  if (!score) {
    throw new ParseError("SCORE_NOT_FOUND", "GeoHistory score was not found.");
  }
  return {
    gameDate: requiredDate(message, receivedAt, timeZone),
    score: Number(score[1].replaceAll(",", "")),
    details: {},
  };
}

export function parseResult(
  game: GameSlug,
  rawMessage: string,
  receivedAt: Date,
  timeZone = "America/Chicago",
): ParsedResult {
  const message = normalizeMessage(rawMessage);
  switch (game) {
    case "maptap":
      return parseMapTap(message, receivedAt, timeZone);
    case "pricepoint":
      return parsePricePoint(message, receivedAt, timeZone);
    case "geoevents":
      return parseGeoEvents(message, receivedAt, timeZone);
    case "geohistory":
      return parseGeoHistory(message, receivedAt, timeZone);
  }
}
