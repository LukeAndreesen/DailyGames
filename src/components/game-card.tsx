import Link from "next/link";
import type { Game, PublicPlayer, RankedResult } from "@/lib/domain";
import { RankMark, SectionHeading } from "@/components/ui";

function formatScore(score: number): string {
  return new Intl.NumberFormat("en-US").format(score);
}

export function GameCard({
  game,
  players,
  rankedResults,
}: {
  game: Game;
  players: PublicPlayer[];
  rankedResults: RankedResult[];
}) {
  const byPlayer = new Map(rankedResults.map((result) => [result.playerId, result]));
  const ordered = [...players].sort((a, b) => {
    const aResult = byPlayer.get(a.id);
    const bResult = byPlayer.get(b.id);
    if (!aResult) return 1;
    if (!bResult) return -1;
    return aResult.displayRank - bResult.displayRank || a.displayOrder - b.displayOrder;
  });

  return (
    <section className="card p-4">
      <SectionHeading title={game.displayName} eyebrow="Today’s game" href={`/games/${game.slug}`} />
      <div className="mt-1 divide-y divide-[var(--line)]">
        {ordered.map((player) => {
          const result = byPlayer.get(player.id);
          return (
            <Link
              key={player.id}
              href={`/players/${player.slug}`}
              className="flex min-h-14 items-center gap-3 py-2"
            >
              <RankMark rank={result?.displayRank ?? null} />
              <span className="min-w-0 flex-1 truncate font-bold">{player.displayName}</span>
              <span className="tabular text-lg font-black">
                {result ? formatScore(result.score) : "—"}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
