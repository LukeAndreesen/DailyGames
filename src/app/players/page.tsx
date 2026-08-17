import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PreviewBanner, RankMark } from "@/components/ui";
import { loadAppData } from "@/lib/data";
import { getOverallStandings } from "@/lib/scoring";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Players" };

export default async function PlayersPage() {
  const data = await loadAppData();
  const standingByPlayer = new Map(
    getOverallStandings(data.players, data.games, data.results).map((standing) => [
      standing.player.id,
      standing,
    ]),
  );
  return (
    <div className="space-y-5 pb-4">
      <PreviewBanner isPreview={data.isPreview} />
      <div>
        <p className="page-kicker text-xs font-black uppercase tracking-[0.16em]">The group</p>
        <h1 className="fun-title text-4xl font-black tracking-tight">Players</h1>
      </div>
      <section className="card divide-y divide-[var(--line)] px-4">
        {data.players.map((player) => {
          const standing = standingByPlayer.get(player.id);
          return (
            <Link
              key={player.id}
              href={`/players/${player.slug}`}
              className="score-row flex min-h-20 items-center gap-3 rounded-xl px-2 py-3"
            >
              <RankMark rank={standing?.rank ?? null} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-black">{player.displayName}</p>
                <p className="text-xs text-[var(--muted)]">
                  {standing?.gamesPlayed ?? 0} games · {standing?.gameWins ?? 0} wins ·{" "}
                  {standing?.averagePlacement?.toFixed(1) ?? "—"} pts
                </p>
              </div>
              <div className="tabular text-right">
                <p className="text-lg font-black text-[var(--brand)]">{standing?.elo ?? 1000}</p>
                <p className="text-[10px] font-black uppercase tracking-wide text-[var(--muted)]">
                  Elo
                </p>
              </div>
              <ChevronRight className="text-[var(--muted)]" size={18} />
            </Link>
          );
        })}
      </section>
    </div>
  );
}
