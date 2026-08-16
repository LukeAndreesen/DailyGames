import { describe, expect, it } from "vitest";
import type { PublicPlayer, Result } from "@/lib/domain";
import { games } from "@/lib/games";
import {
  getDailyStandings,
  getGameStandings,
  getOverallStandings,
  rankGameResults,
} from "@/lib/scoring";

const players: PublicPlayer[] = [
  { id: "a", slug: "alex", displayName: "Alex", displayOrder: 1, active: true },
  { id: "b", slug: "blair", displayName: "Blair", displayOrder: 2, active: true },
  { id: "c", slug: "casey", displayName: "Casey", displayOrder: 3, active: true },
];

function result(
  id: string,
  playerId: string,
  gameId: string,
  gameDate: string,
  score: number,
): Result {
  return {
    id,
    playerId,
    gameId,
    gameDate,
    score,
    details: {},
    receivedAt: `${gameDate}T18:00:00.000Z`,
  };
}

describe("placement scoring", () => {
  const geoHistory = games.find((game) => game.slug === "geohistory")!;

  it("splits tied positions", () => {
    const ranked = rankGameResults(
      [
        result("1", "a", geoHistory.id, "2026-08-16", 900),
        result("2", "b", geoHistory.id, "2026-08-16", 900),
        result("3", "c", geoHistory.id, "2026-08-16", 800),
      ],
      geoHistory,
    );
    expect(ranked[0].displayRank).toBe(1);
    expect(ranked[0].placementScore).toBe(75);
    expect(ranked[1].placementScore).toBe(75);
    expect(ranked[2].placementScore).toBe(0);
  });

  it("excludes a solo submission from placement scoring", () => {
    const ranked = rankGameResults(
      [result("1", "a", geoHistory.id, "2026-08-16", 900)],
      geoHistory,
    );
    expect(ranked[0].placementScore).toBeNull();
    expect(ranked[0].isWinner).toBe(false);
  });

  it("ignores missing games in a daily average", () => {
    const mapTap = games.find((game) => game.slug === "maptap")!;
    const results = [
      result("1", "a", geoHistory.id, "2026-08-16", 900),
      result("2", "b", geoHistory.id, "2026-08-16", 800),
      result("3", "a", mapTap.id, "2026-08-16", 700),
      result("4", "c", mapTap.id, "2026-08-16", 900),
    ];
    const standings = getDailyStandings("2026-08-16", players, games, results);
    expect(standings.find((entry) => entry.player.id === "b")?.averagePlacement).toBe(0);
    expect(standings.find((entry) => entry.player.id === "b")?.gamesPlayed).toBe(1);
    expect(standings.find((entry) => entry.player.id === "a")?.averagePlacement).toBe(50);
  });

  it("weights every qualifying game equally all time", () => {
    const results = [
      result("1", "a", geoHistory.id, "2026-08-15", 900),
      result("2", "b", geoHistory.id, "2026-08-15", 800),
      result("3", "a", geoHistory.id, "2026-08-16", 700),
      result("4", "b", geoHistory.id, "2026-08-16", 900),
      result("5", "c", geoHistory.id, "2026-08-16", 800),
    ];
    const standings = getOverallStandings(players, games, results);
    expect(standings.find((entry) => entry.player.id === "a")?.averagePlacement).toBe(50);
  });

  it("ranks a game by average raw score", () => {
    const results = [
      result("1", "a", geoHistory.id, "2026-08-15", 900),
      result("2", "b", geoHistory.id, "2026-08-15", 850),
      result("3", "a", geoHistory.id, "2026-08-16", 800),
      result("4", "b", geoHistory.id, "2026-08-16", 900),
    ];
    const standings = getGameStandings(geoHistory, players, games, results);
    expect(standings[0].player.id).toBe("b");
    expect(standings[0].averageScore).toBe(875);
  });
});
