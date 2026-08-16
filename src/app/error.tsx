"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="card mt-12 p-8 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Scoreboard error</p>
      <h1 className="mt-2 text-2xl font-black">Something went wrong loading the scores.</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Your data is safe. Try loading this view again.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 min-h-11 rounded-xl bg-[var(--brand)] px-5 font-bold text-white"
      >
        Try again
      </button>
    </div>
  );
}
