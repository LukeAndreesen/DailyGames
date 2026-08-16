import type { AppData, Game, PublicPlayer, Result } from "@/lib/domain";
import { getSql, hasDatabase } from "@/lib/db";
import { sampleData } from "@/lib/sample-data";

type PlayerRow = {
  id: string;
  slug: string;
  display_name: string;
  display_order: number;
  active: boolean;
};

type GameRow = {
  id: string;
  slug: Game["slug"];
  display_name: string;
  max_score: number | null;
  higher_is_better: boolean;
  display_order: number;
};

type ResultRow = {
  id: string;
  player_id: string;
  game_id: string;
  game_date: string | Date;
  score: number;
  details: Record<string, string | number>;
  received_at: string | Date;
};

export async function loadAppData(): Promise<AppData> {
  if (!hasDatabase()) return sampleData;

  const sql = getSql();
  const [playerRows, gameRows, resultRows] = await Promise.all([
    sql<PlayerRow[]>`
      select id, slug, display_name, display_order, active
      from public.players
      where active = true
      order by display_order
    `,
    sql<GameRow[]>`
      select id, slug, display_name, max_score, higher_is_better, display_order
      from public.games
      order by display_order
    `,
    sql<ResultRow[]>`
      select id, player_id, game_id, game_date, score, details, received_at
      from public.results
      order by game_date, received_at
    `,
  ]);

  const players: PublicPlayer[] = playerRows.map((row) => ({
    id: row.id,
    slug: row.slug,
    displayName: row.display_name,
    displayOrder: row.display_order,
    active: row.active,
  }));
  const games: Game[] = gameRows.map((row) => ({
    id: row.id,
    slug: row.slug,
    displayName: row.display_name,
    maxScore: row.max_score,
    higherIsBetter: row.higher_is_better,
    displayOrder: row.display_order,
  }));
  const results: Result[] = resultRows.map((row) => ({
    id: row.id,
    playerId: row.player_id,
    gameId: row.game_id,
    gameDate:
      row.game_date instanceof Date
        ? row.game_date.toISOString().slice(0, 10)
        : String(row.game_date).slice(0, 10),
    score: row.score,
    details: row.details,
    receivedAt:
      row.received_at instanceof Date
        ? row.received_at.toISOString()
        : String(row.received_at),
  }));

  return { players, games, results, isDemo: false };
}
