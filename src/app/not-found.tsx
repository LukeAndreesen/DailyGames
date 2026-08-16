import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card mt-12 p-8 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Not found</p>
      <h1 className="mt-2 text-2xl font-black">That scoreboard page does not exist.</h1>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[var(--brand)] px-5 font-bold text-white"
      >
        Back to today
      </Link>
    </div>
  );
}
