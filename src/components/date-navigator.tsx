import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatLongDate, shiftDate } from "@/lib/date";

export function DateNavigator({ date, today }: { date: string; today: string }) {
  const previous = shiftDate(date, -1);
  const next = shiftDate(date, 1);
  const nextDisabled = next > today;
  return (
    <div className="card mb-5 flex items-center justify-between gap-2 p-2">
      <Link
        href={`/day/${previous}`}
        aria-label="Previous day"
        className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--background)]"
      >
        <ChevronLeft />
      </Link>
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
          {date === today ? "Today" : "Results"}
        </p>
        <h1 className="text-lg font-black">{formatLongDate(date)}</h1>
      </div>
      {nextDisabled ? (
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--background)] opacity-30">
          <ChevronRight />
        </span>
      ) : (
        <Link
          href={next === today ? "/" : `/day/${next}`}
          aria-label="Next day"
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--background)]"
        >
          <ChevronRight />
        </Link>
      )}
    </div>
  );
}
