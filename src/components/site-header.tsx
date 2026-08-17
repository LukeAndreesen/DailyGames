import { Gamepad2, Sparkles } from "lucide-react";
import Link from "next/link";
import { getScoreboardDataMode } from "@/lib/data-mode";

export function SiteHeader() {
  const live = getScoreboardDataMode() === "live";
  return (
    <header className="flex min-h-20 items-center justify-between py-4">
      <Link href="/" className="flex min-h-11 items-center gap-3 rounded-xl py-1 pr-4">
        <span className="logo-mark flex h-11 w-11 items-center justify-center rounded-2xl text-white">
          <Gamepad2 size={23} aria-hidden="true" />
        </span>
        <span>
          <span className="page-kicker flex items-center gap-1 text-xs font-black uppercase tracking-[0.2em]">
            Daily Games <Sparkles size={12} aria-hidden="true" />
          </span>
          <span className="block text-lg font-black tracking-tight">The group scoreboard</span>
        </span>
      </Link>
      <div className="live-pill flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black">
        <span
          className={`h-2 w-2 rounded-full ${live ? "bg-emerald-500" : "bg-amber-500"}`}
          aria-hidden="true"
        />
        {live ? "Live" : "Preview"}
      </div>
    </header>
  );
}
