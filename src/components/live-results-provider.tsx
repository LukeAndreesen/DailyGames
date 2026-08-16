"use client";

import { createClient, type RealtimeChannel } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

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
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return;

    const refresh = () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(() => router.refresh(), 350);
    };
    const supabase = createClient(url, key);
    let channel: RealtimeChannel | null = supabase
      .channel("public-scoreboard-results")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "results" },
        refresh,
      )
      .subscribe();

    const catchUp = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", catchUp);
    window.addEventListener("focus", catchUp);

    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      document.removeEventListener("visibilitychange", catchUp);
      window.removeEventListener("focus", catchUp);
      if (channel) void supabase.removeChannel(channel);
      channel = null;
    };
  }, [enabled, router]);

  return children;
}
