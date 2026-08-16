export type ScoreboardDataMode = "preview" | "live";

export function getScoreboardDataMode(): ScoreboardDataMode {
  const configuredMode = process.env.SCOREBOARD_DATA_MODE?.trim().toLowerCase();

  if (!configuredMode || configuredMode === "preview") return "preview";
  if (configuredMode === "live") return "live";

  throw new Error(
    `SCOREBOARD_DATA_MODE must be "preview" or "live"; received "${configuredMode}".`,
  );
}
