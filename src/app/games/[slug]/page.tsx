import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SelectableTrendChart, type TrendSeries } from "@/components/trend-charts";
import { Metric, PreviewBanner, RankMark, SectionHeading } from "@/components/ui";
import { loadAppData } from "@/lib/data";
import { formatLongDate } from "@/lib/date";
import { buildRankedResults, getGameStandings } from "@/lib/scoring";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadAppData();
  const game = data.games.find((item) => item.slug === slug);
  return { title: game?.displayName ?? "Game" };
}

export default async function GamePage({ params }: Props) {
  const { slug } = await params;
  const data = await loadAppData();
  const game = data.games.find((item) => item.slug === slug);
  if (!game) notFound();

  const gameResults = data.results.filter((result) => result.gameId === game.id);
  const standings = getGameStandings(game, data.players, data.games, gameResults);
  const playerById = new Map(data.players.map((player) => [player.id, player]));
  const dates = [...new Set(gameResults.map((result) => result.gameDate))].sort().reverse();
  const ranked = buildRankedResults(gameResults, data.games);
  const series: TrendSeries[] = standings.map((standing) => ({
    id: standing.player.id,
    label: standing.player.displayName,
    points: gameResults
      .filter((result) => result.playerId === standing.player.id)
      .sort((a, b) => a.gameDate.localeCompare(b.gameDate))
      .map((result) => ({ date: result.gameDate, score: result.score })),
  }));

  return (
    <div className="space-y-5 pb-4">
      <PreviewBanner isPreview={data.isPreview} />
      <div>
        <p className="page-kicker text-xs font-black uppercase tracking-[0.16em]">Game history</p>
        <h1 className="fun-title text-4xl font-black tracking-tight">{game.displayName}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Ranked by average raw score.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Metric label="Days tracked" value={String(dates.length)} />
        <Metric label="Submissions" value={String(gameResults.length)} />
      </div>
      <section className="card p-4">
        <SectionHeading title="All-time leaders" eyebrow="Average score" />
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
                  {standing.wins} wins · {standing.gamesPlayed} played
                </p>
              </div>
              <div className="tabular text-right">
                <p className="text-lg font-black">{Math.round(standing.averageScore).toLocaleString()}</p>
                <p className="text-[10px] text-[var(--muted)]">best {standing.bestScore.toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      {series.length ? (
        <section className="card p-4">
          <SectionHeading title="Score trend" eyebrow="Player history" />
          <div className="mt-3">
            <SelectableTrendChart series={series} />
          </div>
        </section>
      ) : null}
      <section className="card p-4">
        <SectionHeading title="Recent results" eyebrow="Day by day" />
        <div className="mt-2 space-y-4">
          {dates.slice(0, 7).map((date) => {
            const day = ranked
              .filter((result) => result.gameDate === date)
              .sort((a, b) => a.displayRank - b.displayRank);
            return (
              <div key={date} className="rounded-2xl bg-[var(--background)] p-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                  {formatLongDate(date)}
                </p>
                {day.map((result) => (
                  <div key={result.id} className="flex min-h-9 items-center gap-2 text-sm">
                    <span className="w-6 font-black text-[var(--muted)]">{result.displayRank}</span>
                    <span className="flex-1 font-bold">{playerById.get(result.playerId)?.displayName}</span>
                    <span className="tabular font-black">{result.score.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
