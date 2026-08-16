export const gameSlugs = [
  "maptap",
  "pricepoint",
  "geoevents",
  "geohistory",
] as const;

export type GameSlug = (typeof gameSlugs)[number];

export type PublicPlayer = {
  id: string;
  slug: string;
  displayName: string;
  displayOrder: number;
  active: boolean;
};

export type Game = {
  id: string;
  slug: GameSlug;
  displayName: string;
  maxScore: number | null;
  higherIsBetter: boolean;
  displayOrder: number;
};

export type Result = {
  id: string;
  playerId: string;
  gameId: string;
  gameDate: string;
  score: number;
  details: Record<string, string | number>;
  receivedAt: string;
};

export type ParsedResult = {
  gameDate: string;
  score: number;
  details: Record<string, string | number>;
};

export type RankedResult = Result & {
  displayRank: number;
  averageRank: number;
  placementScore: number | null;
  isWinner: boolean;
};

export type DailyStanding = {
  player: PublicPlayer;
  averagePlacement: number | null;
  gamesPlayed: number;
  qualifyingGames: number;
  gameWins: number;
  rank: number | null;
};

export type OverallStanding = {
  player: PublicPlayer;
  averagePlacement: number | null;
  gamesPlayed: number;
  activeDays: number;
  participationRate: number;
  gameWins: number;
  rank: number | null;
};

export type GameStanding = {
  player: PublicPlayer;
  averageScore: number;
  medianScore: number;
  bestScore: number;
  gamesPlayed: number;
  wins: number;
  averagePlacement: number | null;
  rank: number;
};

export type AppData = {
  players: PublicPlayer[];
  games: Game[];
  results: Result[];
  isPreview: boolean;
};
