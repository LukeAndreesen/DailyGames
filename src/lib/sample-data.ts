import type { AppData, PublicPlayer, Result } from "@/lib/domain";
import { games } from "@/lib/games";

const players: PublicPlayer[] = [
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

const gameBySlug = Object.fromEntries(games.map((game) => [game.slug, game]));

const scores = [
  ["2026-08-14", "maptap", [942, 913, 885, 951, 924, 899, 907]],
  ["2026-08-14", "pricepoint", [11150, 9870, 13200, 10440, 14280, 8990]],
  ["2026-08-14", "geoevents", [870, 903, 850, 925, 892, 881, 910]],
  ["2026-08-14", "geohistory", [844, 901, 878, 925, 860, 889]],
  ["2026-08-15", "maptap", [955, 930, 902, 944, 918, 889, 936]],
  ["2026-08-15", "pricepoint", [12020, 10880, 14400, 9980, 13750, 10100, 12900]],
  ["2026-08-15", "geoevents", [901, 875, 930, 920, 888, 840]],
  ["2026-08-15", "geohistory", [910, 886, 897, 934, 870, 901, 925]],
  ["2026-08-16", "maptap", [969, 938, 920, 955, 901, 944]],
  ["2026-08-16", "pricepoint", [14262, 8880, 13110, 12590, 10440]],
  ["2026-08-16", "geoevents", [924, 896, 910, 881, 940, 905, 873]],
  ["2026-08-16", "geohistory", [868, 890, 912, 901, 855, 927]],
] as const;

let resultIndex = 0;
const results: Result[] = scores.flatMap(([gameDate, slug, values]) =>
  values.map((score, playerIndex) => {
    resultIndex += 1;
    return {
      id: `10000000-0000-4000-8000-${String(resultIndex).padStart(12, "0")}`,
      playerId: players[playerIndex].id,
      gameId: gameBySlug[slug].id,
      gameDate,
      score,
      details: {},
      receivedAt: `${gameDate}T18:00:00.000Z`,
    };
  }),
);

export const sampleData: AppData = {
  players,
  games,
  results,
  isDemo: true,
};
