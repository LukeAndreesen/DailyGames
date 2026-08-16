import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { LiveResultsProvider } from "@/components/live-results-provider";
import { SiteHeader } from "@/components/site-header";
import { getScoreboardDataMode } from "@/lib/data-mode";

export const metadata: Metadata = {
  title: {
    default: "Daily Games",
    template: "%s · Daily Games",
  },
  description: "The live daily-game scoreboard for our group.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f1e8" },
    { media: "(prefers-color-scheme: dark)", color: "#101713" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const live = getScoreboardDataMode() === "live";
  return (
    <html lang="en">
      <body>
        <LiveResultsProvider enabled={live}>
          <div className="safe-shell">
            <SiteHeader />
            <main>{children}</main>
          </div>
          <BottomNav />
        </LiveResultsProvider>
      </body>
    </html>
  );
}
