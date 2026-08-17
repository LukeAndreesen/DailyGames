import Link from "next/link";
import type { DailyStanding, OverallStanding } from "@/lib/domain";
import { RankMark } from "@/components/ui";

export function DailyLeaderboardList({ standings }: { standings: DailyStanding[] }) {
  return (
    <div className="divide-y divide-[var(--line)]">
      {standings.map((standing) => (
        <Link
          key={standing.player.id}
          href={`/players/${standing.player.slug}`}
          className="score-row flex min-h-16 items-center gap-3 rounded-xl px-2 py-3"
        >
          <RankMark rank={standing.rank} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-extrabold">{standing.player.displayName}</p>
            <p className="text-xs text-[var(--muted)]">
              {standing.gamesPlayed} played · {standing.gameWins} game {standing.gameWins === 1 ? "win" : "wins"}
            </p>
          </div>
          <div className="tabular text-right">
            <p className="text-xl font-black">
              {standing.averagePlacement === null ? "—" : standing.averagePlacement.toFixed(1)}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">rank pts</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function OverallLeaderboardList({ standings }: { standings: OverallStanding[] }) {
  return (
    <div className="divide-y divide-[var(--line)]">
      {standings.map((standing) => (
        <Link
          key={standing.player.id}
          href={`/players/${standing.player.slug}`}
          className="score-row flex min-h-18 items-center gap-3 rounded-xl px-2 py-3"
        >
          <RankMark rank={standing.rank} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-extrabold">{standing.player.displayName}</p>
            <p className="text-xs text-[var(--muted)]">
              {standing.gamesPlayed} games · {standing.participationRate.toFixed(0)}% played ·{" "}
              {standing.averagePlacement === null ? "—" : standing.averagePlacement.toFixed(1)} pts
            </p>
          </div>
          <div className="tabular text-right">
            <p className="text-xl font-black text-[var(--brand)]">{standing.elo}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
              Elo
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
