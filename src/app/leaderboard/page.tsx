import type { Metadata } from "next";
import { OverallLeaderboardList } from "@/components/leaderboard-list";
import {
  EloExplainer,
  Metric,
  PreviewBanner,
  ScoringExplainer,
  SectionHeading,
} from "@/components/ui";
import { loadAppData } from "@/lib/data";
import { getOverallStandings } from "@/lib/scoring";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Leaderboard" };

export default async function LeaderboardPage() {
  const data = await loadAppData();
  const standings = getOverallStandings(data.players, data.games, data.results);
  const trackedDays = new Set(data.results.map((result) => result.gameDate)).size;
  return (
    <div className="space-y-5 pb-4">
      <PreviewBanner isPreview={data.isPreview} />
      <div>
        <p className="page-kicker text-xs font-black uppercase tracking-[0.16em]">All time</p>
        <h1 className="fun-title text-4xl font-black tracking-tight">Leaderboard</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          The definitive pecking order—powered by Elo and normalized rank points.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Metric label="Days tracked" value={String(trackedDays)} />
        <Metric label="Scores logged" value={String(data.results.length)} />
      </div>
      <section className="card p-4">
        <SectionHeading title="Overall standings" eyebrow="Elo rating" />
        <OverallLeaderboardList standings={standings} />
      </section>
      <EloExplainer />
      <ScoringExplainer />
    </div>
  );
}
