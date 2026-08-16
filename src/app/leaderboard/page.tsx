import type { Metadata } from "next";
import { OverallLeaderboardList } from "@/components/leaderboard-list";
import { Metric, PreviewBanner, SectionHeading } from "@/components/ui";
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
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">All time</p>
        <h1 className="text-3xl font-black tracking-tight">Leaderboard</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Average placement across every game played. Missing games never lower the average.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Metric label="Days tracked" value={String(trackedDays)} />
        <Metric label="Scores logged" value={String(data.results.length)} />
      </div>
      <section className="card p-4">
        <SectionHeading title="Overall standings" eyebrow="Average placement" />
        <OverallLeaderboardList standings={standings} />
      </section>
      <p className="px-2 text-xs leading-5 text-[var(--muted)]">
        Solo entries count toward participation and raw-score statistics, but require an opponent to earn placement credit.
      </p>
    </div>
  );
}
