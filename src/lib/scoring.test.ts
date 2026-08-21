import { describe, expect, it } from "vitest";
import type { PublicPlayer, Result } from "@/lib/domain";
import { games } from "@/lib/games";
import {
  getDailyStandings,
  getEloRatings,
  getGameStandings,
  getChudHighlights,
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

  it("counts missing games as zero in a daily average", () => {
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
    expect(standings.find((entry) => entry.player.id === "a")?.averagePlacement).toBe(25);
    expect(standings.find((entry) => entry.player.id === "c")?.averagePlacement).toBe(25);
  });

  it("assigns zero when a player misses every game of the day", () => {
    const standings = getDailyStandings("2026-08-16", players, games, []);
    expect(standings.find((entry) => entry.player.id === "a")?.averagePlacement).toBe(0);
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

  it("updates multiplayer Elo chronologically and splits ties", () => {
    const results = [
      result("1", "a", geoHistory.id, "2026-08-15", 900),
      result("2", "b", geoHistory.id, "2026-08-15", 800),
      result("3", "c", geoHistory.id, "2026-08-15", 700),
      result("4", "a", geoHistory.id, "2026-08-16", 800),
      result("5", "b", geoHistory.id, "2026-08-16", 900),
      result("6", "c", geoHistory.id, "2026-08-16", 800),
    ];
    const ratings = getEloRatings(players, games, results);

    expect(ratings.get("a")).toBeCloseTo(1006.9, 2);
    expect(ratings.get("b")).toBeCloseTo(1016, 2);
    expect(ratings.get("c")).toBeCloseTo(977.1, 2);
    expect(getOverallStandings(players, games, results)[0].player.id).toBe("b");
  });

  it("does not change Elo for a solo result", () => {
    const ratings = getEloRatings(
      players,
      games,
      [result("1", "a", geoHistory.id, "2026-08-16", 900)],
    );
    expect(ratings.get("a")).toBe(1000);
  });

  it("finds the lowest rank score for day, calendar week, and all time", () => {
    const results = [
      result("1", "a", geoHistory.id, "2026-08-08", 900),
      result("2", "b", geoHistory.id, "2026-08-08", 800),
      result("3", "c", geoHistory.id, "2026-08-08", 700),
      result("4", "a", geoHistory.id, "2026-08-09", 900),
      result("5", "b", geoHistory.id, "2026-08-09", 800),
      result("6", "c", geoHistory.id, "2026-08-09", 700),
      result("7", "a", geoHistory.id, "2026-08-16", 900),
      result("8", "b", geoHistory.id, "2026-08-16", 700),
      result("9", "c", geoHistory.id, "2026-08-16", 800),
    ];
    const chuds = getChudHighlights("2026-08-16", players, games, results);

    expect(chuds.find((entry) => entry.label === "Day")?.player?.id).toBe("b");
    expect(chuds.find((entry) => entry.label === "Week")?.player?.id).toBe("b");
    expect(chuds.find((entry) => entry.label === "All time")?.player?.id).toBe("c");
  });

  it("averages daily scores from Monday through the reference day", () => {
    const results = [
      result("1", "a", geoHistory.id, "2026-08-17", 900),
      result("2", "b", geoHistory.id, "2026-08-17", 700),
      result("3", "c", geoHistory.id, "2026-08-17", 800),
      result("4", "a", geoHistory.id, "2026-08-18", 900),
      result("5", "b", geoHistory.id, "2026-08-18", 800),
      result("6", "c", geoHistory.id, "2026-08-18", 700),
    ];

    const monday = getChudHighlights("2026-08-17", players, games, results);
    expect(monday.find((entry) => entry.label === "Week")?.averagePlacement).toBe(
      monday.find((entry) => entry.label === "Day")?.averagePlacement,
    );

    const tuesday = getChudHighlights("2026-08-18", players, games, results);
    const weeklyChud = tuesday.find((entry) => entry.label === "Week");
    expect(weeklyChud?.player?.id).toBe("b");
    expect(weeklyChud?.averagePlacement).toBe(6.25);
    expect(weeklyChud?.gamesPlayed).toBe(2);
  });
});
