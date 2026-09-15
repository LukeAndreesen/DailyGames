"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const REFRESH_INTERVAL_MS = 15_000;

export function LiveResultsProvider({
  children,
  enabled,
}: {
  children: React.ReactNode;
  enabled: boolean;
}) {
  const router = useRouter();
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const refresh = () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(() => router.refresh(), 350);
    };

    const catchUp = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const refreshInterval = window.setInterval(catchUp, REFRESH_INTERVAL_MS);
    document.addEventListener("visibilitychange", catchUp);
    window.addEventListener("focus", catchUp);

    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      window.clearInterval(refreshInterval);
      document.removeEventListener("visibilitychange", catchUp);
      window.removeEventListener("focus", catchUp);
    };
  }, [enabled, router]);

  return children;
}
