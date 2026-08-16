const monthNumbers: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function dateInTimeZone(date: Date, timeZone: string): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function parseSharedMonthDay(
  message: string,
  receivedAt: Date,
  timeZone: string,
): string | null {
  const match = message.match(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:st|nd|rd|th)?\b/i,
  );
  if (!match) return null;

  const month = monthNumbers[match[1].toLowerCase()];
  const day = Number(match[2]);
  const localYear = Number(dateInTimeZone(receivedAt, timeZone).slice(0, 4));
  const candidates = [localYear - 1, localYear, localYear + 1]
    .map((year) => ({
      year,
      value: new Date(Date.UTC(year, month - 1, day, 12)),
    }))
    .filter(
      ({ year, value }) =>
        value.getUTCFullYear() === year &&
        value.getUTCMonth() === month - 1 &&
        value.getUTCDate() === day,
    );

  if (candidates.length === 0) return null;
  const closest = candidates.reduce((best, candidate) =>
    Math.abs(candidate.value.getTime() - receivedAt.getTime()) <
    Math.abs(best.value.getTime() - receivedAt.getTime())
      ? candidate
      : best,
  );
  return `${closest.year}-${pad(month)}-${pad(day)}`;
}

export function formatLongDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

export function shiftDate(date: string, days: number): string {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
