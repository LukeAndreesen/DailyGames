import { describe, expect, it } from "vitest";
import type { PublicPlayer } from "@/lib/domain";
import { games } from "@/lib/games";
import { createPreviewData } from "@/lib/sample-data";

const players: PublicPlayer[] = [
  { id: "player-a", slug: "alex", displayName: "Alex", displayOrder: 1, active: true },
  { id: "player-b", slug: "blair", displayName: "Blair", displayOrder: 2, active: true },
  { id: "player-c", slug: "casey", displayName: "Casey", displayOrder: 3, active: true },
];

describe("preview data", () => {
  it("generates a deterministic seven-day history from the supplied players and games", () => {
    const first = createPreviewData({ players, games, today: "2026-08-16" });
    const second = createPreviewData({ players, games, today: "2026-08-16" });
    const dates = [...new Set(first.results.map((result) => result.gameDate))];

    expect(first).toEqual(second);
    expect(first.isPreview).toBe(true);
    expect(first.players).toBe(players);
    expect(dates).toEqual([
      "2026-08-10",
      "2026-08-11",
      "2026-08-12",
      "2026-08-13",
      "2026-08-14",
      "2026-08-15",
      "2026-08-16",
    ]);
  });

  it("marks every generated result as synthetic and keeps references in the supplied data set", () => {
    const data = createPreviewData({ players, games, today: "2026-08-16" });
    const playerIds = new Set(players.map((player) => player.id));
    const gameIds = new Set(games.map((game) => game.id));

    expect(data.results.length).toBeGreaterThan(0);
    for (const result of data.results) {
      expect(result.id).toMatch(/^preview-result-/);
      expect(result.details).toEqual({ preview: "synthetic" });
      expect(playerIds.has(result.playerId)).toBe(true);
      expect(gameIds.has(result.gameId)).toBe(true);
    }
  });
});
