import type { AppData } from "@/lib/domain";
import { DateNavigator } from "@/components/date-navigator";
import { GameCard } from "@/components/game-card";
import {
  DailyLeaderboardList,
  OverallLeaderboardList,
} from "@/components/leaderboard-list";
import { ChudSpotlights } from "@/components/chud-spotlights";
import {
  EmptyState,
  PreviewBanner,
  ScoringExplainer,
  SectionHeading,
} from "@/components/ui";
import {
  buildRankedResults,
  getDailyStandings,
  getChudHighlights,
  getOverallStandings,
} from "@/lib/scoring";

export function DailyDashboard({
  data,
  date,
  today,
}: {
  data: AppData;
  date: string;
  today: string;
}) {
  const dailyResults = data.results.filter((result) => result.gameDate === date);
  const dailyStandings = getDailyStandings(date, data.players, data.games, data.results);
  const ranked = buildRankedResults(dailyResults, data.games);
  const overall = getOverallStandings(data.players, data.games, data.results).slice(0, 3);
  const chudHighlights = getChudHighlights(date, data.players, data.games, data.results);

  return (
    <div className="space-y-5 pb-4">
      <PreviewBanner isPreview={data.isPreview} />
      <DateNavigator date={date} today={today} />

      <section className="card overflow-hidden p-4">
        <SectionHeading title="Daily leaderboard" eyebrow="Rank score · 0–100" />
        {dailyResults.length ? (
          <DailyLeaderboardList standings={dailyStandings} />
        ) : (
          <EmptyState>No scores have arrived for this date yet.</EmptyState>
        )}
        <div className="mt-3">
          <ScoringExplainer />
        </div>
      </section>

      <ChudSpotlights highlights={chudHighlights} />

      <div className="space-y-4">
        {data.games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            players={data.players}
            rankedResults={ranked.filter((result) => result.gameId === game.id)}
          />
        ))}
      </div>

      <section className="card overflow-hidden p-4">
        <SectionHeading title="All-time leaders" eyebrow="Quick look" href="/leaderboard" />
        <OverallLeaderboardList standings={overall} />
      </section>
    </div>
  );
}
