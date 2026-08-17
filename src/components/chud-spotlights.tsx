import { Skull } from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "@/components/ui";
import type { ChudHighlight } from "@/lib/domain";

const descriptions: Record<ChudHighlight["label"], string> = {
  Day: "Today’s tough break",
  Week: "Last 7 days",
  "All time": "The eternal struggle",
};

const titles: Record<ChudHighlight["label"], string> = {
  Day: "Chud of the day",
  Week: "Chud of the week",
  "All time": "All-time Chud",
};

export function ChudSpotlights({
  highlights,
}: {
  highlights: ChudHighlight[];
}) {
  return (
    <section className="card chud-section overflow-hidden p-4">
      <SectionHeading title="The Chud lounge" />
      <div className="mt-2 grid gap-3 sm:grid-cols-3">
        {highlights.map((highlight, index) => {
          const content = (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] opacity-70">
                    {titles[highlight.label]}
                  </p>
                  <p className="mt-1 text-lg font-black leading-tight">
                    {highlight.player?.displayName ?? "TBD"}
                  </p>
                </div>
                <span className="chud-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                  <Skull size={18} aria-hidden="true" />
                </span>
              </div>
              <p className="mt-3 text-xs font-bold opacity-75">
                {descriptions[highlight.label]}
              </p>
              <p className="mt-1 text-sm font-black tabular">
                {highlight.averagePlacement === null
                  ? "No qualifying scores"
                  : `${highlight.averagePlacement.toFixed(1)} rank pts · ${highlight.gamesPlayed} played`}
              </p>
            </>
          );

          return highlight.player ? (
            <Link
              key={highlight.label}
              href={`/players/${highlight.player.slug}`}
              className={`chud-card chud-card-${index + 1} block rounded-2xl p-4`}
            >
              {content}
            </Link>
          ) : (
            <div
              key={highlight.label}
              className={`chud-card chud-card-${index + 1} rounded-2xl p-4`}
            >
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
