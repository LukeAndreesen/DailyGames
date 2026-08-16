import { ChevronRight, Trophy } from "lucide-react";
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
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-amber-600">
        <Trophy size={18} aria-label="First place" />
      </span>
    );
  }
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--background)] text-sm font-black text-[var(--muted)]">
      {rank ?? "—"}
    </span>
  );
}

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[var(--background)] px-3 py-3">
      <p className="text-xs font-semibold text-[var(--muted)]">{label}</p>
      <p className="tabular mt-1 text-lg font-black">{value}</p>
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
