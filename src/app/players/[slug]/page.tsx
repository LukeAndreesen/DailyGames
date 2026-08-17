import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { SelectableTrendChart, type TrendSeries } from "@/components/trend-charts";
import { Metric, PreviewBanner, SectionHeading } from "@/components/ui";
import { loadAppData } from "@/lib/data";
import { getGameStandings, getOverallStandings } from "@/lib/scoring";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadAppData();
  return { title: data.players.find((player) => player.slug === slug)?.displayName ?? "Player" };
}

export default async function PlayerPage({ params }: Props) {
  const { slug } = await params;
  const data = await loadAppData();
  const player = data.players.find((item) => item.slug === slug);
  if (!player) notFound();
  const overall = getOverallStandings(data.players, data.games, data.results).find(
    (standing) => standing.player.id === player.id,
  );
  const playerResults = data.results.filter((result) => result.playerId === player.id);
  const gameStats = data.games.flatMap((game) => {
    const standing = getGameStandings(game, data.players, data.games, data.results).find(
      (item) => item.player.id === player.id,
    );
    return standing ? [{ game, standing }] : [];
  });
  const series: TrendSeries[] = gameStats.map(({ game }) => ({
    id: game.id,
    label: game.displayName,
    points: playerResults
      .filter((result) => result.gameId === game.id)
      .sort((a, b) => a.gameDate.localeCompare(b.gameDate))
      .map((result) => ({ date: result.gameDate, score: result.score })),
  }));

  return (
    <div className="space-y-5 pb-4">
      <PreviewBanner isPreview={data.isPreview} />
      <div>
        <p className="page-kicker text-xs font-black uppercase tracking-[0.16em]">Player profile</p>
        <h1 className="fun-title text-4xl font-black tracking-tight">{player.displayName}</h1>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Metric label="Elo rating" value={String(overall?.elo ?? 1000)} />
        <Metric label="Overall rank" value={overall?.rank ? `#${overall.rank}` : "—"} />
        <Metric
          label="Rank points"
          value={overall?.averagePlacement === null || overall?.averagePlacement === undefined ? "—" : overall.averagePlacement.toFixed(1)}
        />
        <Metric label="Games played" value={String(overall?.gamesPlayed ?? 0)} />
        <Metric label="Participation" value={`${(overall?.participationRate ?? 0).toFixed(0)}%`} />
        <Metric label="Game wins" value={String(overall?.gameWins ?? 0)} />
      </div>
      <section className="card p-4">
        <SectionHeading title="By game" eyebrow="Performance" />
        <div className="mt-2 divide-y divide-[var(--line)]">
          {gameStats.map(({ game, standing }) => (
            <Link
              key={game.id}
              href={`/games/${game.slug}`}
              className="score-row flex min-h-20 items-center gap-3 rounded-xl px-2 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-black">{game.displayName}</p>
                <p className="text-xs text-[var(--muted)]">
                  {standing.wins} wins · {standing.gamesPlayed} played · #{standing.rank} all time
                </p>
              </div>
              <div className="tabular text-right">
                <p className="font-black">{Math.round(standing.averageScore).toLocaleString()}</p>
                <p className="text-[10px] text-[var(--muted)]">average</p>
              </div>
              <ChevronRight size={18} className="text-[var(--muted)]" />
            </Link>
          ))}
        </div>
      </section>
      {series.length ? (
        <section className="card p-4">
          <SectionHeading title="Score history" eyebrow="Trend" />
          <div className="mt-3">
            <SelectableTrendChart series={series} selectLabel="Game" />
          </div>
        </section>
      ) : null}
    </div>
  );
}
