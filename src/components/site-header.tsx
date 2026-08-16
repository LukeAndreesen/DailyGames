import Link from "next/link";
import { getScoreboardDataMode } from "@/lib/data-mode";

export function SiteHeader() {
  const live = getScoreboardDataMode() === "live";
  return (
    <header className="flex min-h-20 items-center justify-between py-4">
      <Link href="/" className="min-h-11 rounded-xl py-1 pr-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand)]">
          Daily Games
        </p>
        <p className="text-xl font-black tracking-tight">The group scoreboard</p>
      </Link>
      <div className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-bold">
        <span
          className={`h-2 w-2 rounded-full ${live ? "bg-emerald-500" : "bg-amber-500"}`}
          aria-hidden="true"
        />
        {live ? "Live" : "Preview"}
      </div>
    </header>
  );
}
