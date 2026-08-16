import type { AppData, Game, GameSlug, PublicPlayer, Result } from "@/lib/domain";
import { shiftDate } from "@/lib/date";
import { games as defaultGames } from "@/lib/games";

export const previewPlayers: PublicPlayer[] = [
  "Alex",
  "Blair",
  "Casey",
  "Drew",
  "Emery",
  "Finley",
  "Gray",
].map((displayName, index) => ({
  id: `00000000-0000-4000-8000-00000000020${index + 1}`,
  slug: displayName.toLowerCase(),
  displayName,
  displayOrder: index + 1,
  active: true,
}));

const scoreRanges: Record<GameSlug, { base: number; range: number }> = {
  maptap: { base: 780, range: 220 },
  pricepoint: { base: 8_000, range: 7_001 },
  geoevents: { base: 720, range: 280 },
  geohistory: { base: 740, range: 260 },
};

function previewScore(
  game: Game,
  playerIndex: number,
  dayIndex: number,
  gameIndex: number,
): number {
  const { base, range } = scoreRanges[game.slug];
  const variation =
    (playerIndex * 97 + dayIndex * 53 + gameIndex * 31 + playerIndex * dayIndex * 17) %
    range;
  const score = base + variation;
  return game.maxScore === null ? score : Math.min(score, game.maxScore);
}

export function createPreviewData({
  players = previewPlayers,
  games = defaultGames,
  today,
}: {
  players?: PublicPlayer[];
  games?: Game[];
  today: string;
}): AppData {
  const dates = Array.from({ length: 7 }, (_, index) => shiftDate(today, index - 6));
  let resultIndex = 0;

  const results: Result[] = dates.flatMap((gameDate, dayIndex) =>
    games.flatMap((game, gameIndex) =>
      players.flatMap((player, playerIndex) => {
        const isMissingSubmission =
          players.length > 3 &&
          (playerIndex * 2 + dayIndex * 3 + gameIndex * 5) % 13 === 0;
        if (isMissingSubmission) return [];

        resultIndex += 1;
        return [
          {
            id: `preview-result-${String(resultIndex).padStart(4, "0")}`,
            playerId: player.id,
            gameId: game.id,
            gameDate,
            score: previewScore(game, playerIndex, dayIndex, gameIndex),
            details: { preview: "synthetic" },
            receivedAt: `${gameDate}T${String(14 + (playerIndex % 7)).padStart(2, "0")}:00:00.000Z`,
          },
        ];
      }),
    ),
  );

  return { players, games, results, isPreview: true };
}
