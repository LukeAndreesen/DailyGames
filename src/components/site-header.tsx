import Link from "next/link";

export function SiteHeader() {
  const live = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
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
        {live ? "Live" : "Demo"}
      </div>
    </header>
  );
}
