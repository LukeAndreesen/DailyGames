import { ChevronRight, CircleHelp, Trophy, Zap } from "lucide-react";
import Link from "next/link";

export function PreviewBanner({ isPreview }: { isPreview: boolean }) {
  if (!isPreview) return null;
  return (
    <div className="mb-4 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm">
      <strong>Preview only.</strong> Every score shown is synthetic and no preview results are
      stored in Supabase.
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  href,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
}) {
  const content = (
    <div className="flex min-h-12 items-center justify-between gap-3">
      <div>
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-xl font-black tracking-tight">{title}</h2>
      </div>
      {href ? <ChevronRight className="text-[var(--muted)]" aria-hidden="true" /> : null}
    </div>
  );
  return href ? (
    <Link href={href} className="block rounded-xl">
      {content}
    </Link>
  ) : (
    content
  );
}

export function RankMark({ rank }: { rank: number | null }) {
  if (rank === 1) {
    return (
      <span className="rank-mark rank-mark-first flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-amber-950">
        <Trophy size={18} aria-label="First place" />
      </span>
    );
  }
  return (
    <span
      className={`rank-mark flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-black ${rank === 2 ? "rank-mark-second" : rank === 3 ? "rank-mark-third" : ""}`}
      aria-label={rank === null ? "Not ranked" : `Rank ${rank}`}
    >
      {rank ?? "—"}
    </span>
  );
}

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-card rounded-2xl px-4 py-3">
      <p className="text-xs font-semibold text-[var(--muted)]">{label}</p>
      <p className="tabular mt-1 text-lg font-black">{value}</p>
    </div>
  );
}

export function ScoringExplainer() {
  return (
    <div className="score-explainer rounded-2xl p-4 text-sm leading-6">
      <div className="flex gap-3">
        <CircleHelp
          className="mt-0.5 shrink-0 text-[var(--brand)]"
          size={20}
          aria-hidden="true"
        />
        <div>
          <p className="font-black">Where do rank points come from?</p>
          <p className="mt-1 text-[var(--muted)]">
            Each game is converted to a fair 0–100 score: first place gets 100, last gets 0, and
            everyone between is spaced evenly. Ties split the tied places. We average those points;
            missed games and solo entries do not lower the score.
          </p>
        </div>
      </div>
    </div>
  );
}

export function EloExplainer() {
  return (
    <div className="elo-explainer rounded-2xl p-4 text-sm leading-6">
      <div className="flex gap-3">
        <Zap className="mt-0.5 shrink-0" size={20} aria-hidden="true" />
        <p>
          <strong>Elo starts at 1000.</strong> It rises when you beat opponents—especially higher-rated
          ones—and falls after losses. Every multiplayer game updates it; ties split the result.
        </p>
      </div>
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--line)] px-5 py-8 text-center text-sm text-[var(--muted)]">
      {children}
    </div>
  );
}
