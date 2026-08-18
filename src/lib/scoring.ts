import type {
  DailyStanding,
  Game,
  GameStanding,
  ChudHighlight,
  OverallStanding,
  PublicPlayer,
  RankedResult,
  Result,
} from "@/lib/domain";
import { shiftDate } from "@/lib/date";

export const INITIAL_ELO = 1000;
export const ELO_K_FACTOR = 32;

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function assignRanks<T>(
  values: T[],
  getScore: (value: T) => number | null,
): Map<T, number | null> {
  const ranked = values
    .filter((value) => getScore(value) !== null)
    .sort((a, b) => (getScore(b) ?? 0) - (getScore(a) ?? 0));
  const output = new Map<T, number | null>(values.map((value) => [value, null]));
  let previous: number | null = null;
  let rank = 0;
  ranked.forEach((value, index) => {
    const score = getScore(value);
    if (score !== previous) rank = index + 1;
    output.set(value, rank);
    previous = score;
  });
  return output;
}

export function rankGameResults(results: Result[], game: Game): RankedResult[] {
  const sorted = [...results].sort((a, b) =>
    game.higherIsBetter ? b.score - a.score : a.score - b.score,
  );
  const participantCount = sorted.length;
  const ranked: RankedResult[] = [];

  for (let index = 0; index < sorted.length; ) {
    const score = sorted[index].score;
    let end = index + 1;
    while (end < sorted.length && sorted[end].score === score) end += 1;
    const displayRank = index + 1;
    const averageRank = (displayRank + end) / 2;
    const placementScore =
      participantCount < 2
        ? null
        : (100 * (participantCount - averageRank)) / (participantCount - 1);

    for (let cursor = index; cursor < end; cursor += 1) {
      ranked.push({
        ...sorted[cursor],
        displayRank,
        averageRank,
        placementScore,
        isWinner: participantCount >= 2 && displayRank === 1,
      });
    }
    index = end;
  }
  return ranked;
}

export function buildRankedResults(results: Result[], games: Game[]): RankedResult[] {
  const gameById = new Map(games.map((game) => [game.id, game]));
  const groups = new Map<string, Result[]>();
  results.forEach((result) => {
    const key = `${result.gameId}:${result.gameDate}`;
    groups.set(key, [...(groups.get(key) ?? []), result]);
  });
  return [...groups.values()].flatMap((group) => {
    const game = gameById.get(group[0].gameId);
    return game ? rankGameResults(group, game) : [];
  });
}

/**
 * Calculates multiplayer Elo as a set of simultaneous pairwise matchups.
 * Every player can gain or lose at most one K-factor per game, regardless of
 * how many opponents submitted a score.
 */
export function getEloRatings(
  players: PublicPlayer[],
  games: Game[],
  results: Result[],
): Map<string, number> {
  const ratings = new Map(players.map((player) => [player.id, INITIAL_ELO]));
  const gameOrder = new Map(games.map((game) => [game.id, game.displayOrder]));
  const groups = new Map<string, RankedResult[]>();

  buildRankedResults(results, games).forEach((result) => {
    const key = `${result.gameDate}:${result.gameId}`;
    groups.set(key, [...(groups.get(key) ?? []), result]);
    if (!ratings.has(result.playerId)) ratings.set(result.playerId, INITIAL_ELO);
  });

  const rounds = [...groups.values()].sort((a, b) => {
    const dateComparison = a[0].gameDate.localeCompare(b[0].gameDate);
    return (
      dateComparison ||
      (gameOrder.get(a[0].gameId) ?? 0) - (gameOrder.get(b[0].gameId) ?? 0)
    );
  });

  rounds.forEach((round) => {
    if (round.length < 2) return;
    const before = new Map(
      round.map((result) => [result.playerId, ratings.get(result.playerId) ?? INITIAL_ELO]),
    );

    round.forEach((result) => {
      const rating = before.get(result.playerId) ?? INITIAL_ELO;
      let matchupDelta = 0;
      round.forEach((opponent) => {
        if (opponent.playerId === result.playerId) return;
        const opponentRating = before.get(opponent.playerId) ?? INITIAL_ELO;
        const expected = 1 / (1 + 10 ** ((opponentRating - rating) / 400));
        const actual =
          result.averageRank < opponent.averageRank
            ? 1
            : result.averageRank > opponent.averageRank
              ? 0
              : 0.5;
        matchupDelta += actual - expected;
      });
      ratings.set(
        result.playerId,
        rating + (ELO_K_FACTOR * matchupDelta) / (round.length - 1),
      );
    });
  });

  return ratings;
}

export function getDailyStandings(
  date: string,
  players: PublicPlayer[],
  games: Game[],
  results: Result[],
): DailyStanding[] {
  const daily = results.filter((result) => result.gameDate === date);
  const ranked = buildRankedResults(daily, games);
  const dailyGameCount = games.length;
  const standings = players.map((player) => {
    const played = ranked.filter((result) => result.playerId === player.id);
    const placementByGameId = new Map(
      played.map((result) => [result.gameId, result.placementScore ?? 0]),
    );
    const dailyPlacementScores = games.map((game) => placementByGameId.get(game.id) ?? 0);
    const qualifying = played.flatMap((result) =>
      result.placementScore === null ? [] : [result.placementScore],
    );
    return {
      player,
      averagePlacement: dailyGameCount ? average(dailyPlacementScores) : null,
      gamesPlayed: played.length,
      qualifyingGames: qualifying.length,
      gameWins: played.filter((result) => result.isWinner).length,
      rank: null,
    } satisfies DailyStanding;
  });
  const ranks = assignRanks(standings, (standing) => standing.averagePlacement);
  return standings
    .map((standing) => ({ ...standing, rank: ranks.get(standing) ?? null }))
    .sort((a, b) => {
      if (a.rank === null) return 1;
      if (b.rank === null) return -1;
      return a.rank - b.rank || a.player.displayOrder - b.player.displayOrder;
    });
}

export function getOverallStandings(
  players: PublicPlayer[],
  games: Game[],
  results: Result[],
): OverallStanding[] {
  const ranked = buildRankedResults(results, games);
  const eloRatings = getEloRatings(players, games, results);
  const trackedGameDays = new Set(
    results.map((result) => `${result.gameId}:${result.gameDate}`),
  ).size;
  const standings = players.map((player) => {
    const played = ranked.filter((result) => result.playerId === player.id);
    const qualifying = played.flatMap((result) =>
      result.placementScore === null ? [] : [result.placementScore],
    );
    return {
      player,
      averagePlacement: qualifying.length ? average(qualifying) : null,
      elo: Math.round(eloRatings.get(player.id) ?? INITIAL_ELO),
      gamesPlayed: played.length,
      activeDays: new Set(played.map((result) => result.gameDate)).size,
      participationRate: trackedGameDays
        ? (100 * played.length) / trackedGameDays
        : 0,
      gameWins: played.filter((result) => result.isWinner).length,
      rank: null,
    } satisfies OverallStanding;
  });
  const ranks = assignRanks(standings, (standing) =>
    standing.gamesPlayed ? standing.elo : null,
  );
  return standings
    .map((standing) => ({ ...standing, rank: ranks.get(standing) ?? null }))
    .sort((a, b) => {
      if (a.rank === null) return 1;
      if (b.rank === null) return -1;
      return a.rank - b.rank || a.player.displayOrder - b.player.displayOrder;
    });
}

function lowestStanding(standings: OverallStanding[]): OverallStanding | null {
  return standings.reduce<OverallStanding | null>((lowest, standing) => {
    if (standing.averagePlacement === null) return lowest;
    if (!lowest || lowest.averagePlacement === null) return standing;
    if (standing.averagePlacement < lowest.averagePlacement) return standing;
    if (
      standing.averagePlacement === lowest.averagePlacement &&
      standing.player.displayOrder < lowest.player.displayOrder
    ) {
      return standing;
    }
    return lowest;
  }, null);
}

export function getChudHighlights(
  referenceDate: string,
  players: PublicPlayer[],
  games: Game[],
  results: Result[],
): ChudHighlight[] {
  const weekStart = shiftDate(referenceDate, -6);
  const periods: Array<{ label: ChudHighlight["label"]; results: Result[] }> = [
    {
      label: "Day",
      results: results.filter((result) => result.gameDate === referenceDate),
    },
    {
      label: "Week",
      results: results.filter(
        (result) => result.gameDate >= weekStart && result.gameDate <= referenceDate,
      ),
    },
    { label: "All time", results },
  ];

  return periods.map((period) => {
    const chud = lowestStanding(getOverallStandings(players, games, period.results));
    return {
      label: period.label,
      player: chud?.player ?? null,
      averagePlacement: chud?.averagePlacement ?? null,
      gamesPlayed: chud?.gamesPlayed ?? 0,
    };
  });
}

export function getGameStandings(
  game: Game,
  players: PublicPlayer[],
  allGames: Game[],
  results: Result[],
): GameStanding[] {
  const gameResults = results.filter((result) => result.gameId === game.id);
  const ranked = buildRankedResults(gameResults, allGames);
  const standings = players.flatMap((player) => {
    const played = ranked.filter((result) => result.playerId === player.id);
    if (!played.length) return [];
    const scores = played.map((result) => result.score);
    const placements = played.flatMap((result) =>
      result.placementScore === null ? [] : [result.placementScore],
    );
    return [
      {
        player,
        averageScore: average(scores),
        medianScore: median(scores),
        bestScore: game.higherIsBetter ? Math.max(...scores) : Math.min(...scores),
        gamesPlayed: played.length,
        wins: played.filter((result) => result.isWinner).length,
        averagePlacement: placements.length ? average(placements) : null,
        rank: 0,
      },
    ];
  });
  standings.sort((a, b) =>
    game.higherIsBetter
      ? b.averageScore - a.averageScore
      : a.averageScore - b.averageScore,
  );
  let previous: number | null = null;
  let rank = 0;
  return standings.map((standing, index) => {
    if (standing.averageScore !== previous) rank = index + 1;
    previous = standing.averageScore;
    return { ...standing, rank };
  });
}
