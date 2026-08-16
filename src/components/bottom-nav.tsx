"use client";

import { ChartNoAxesColumnIncreasing, House, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Today", icon: House, matches: (path: string) => path === "/" || path.startsWith("/day/") },
  {
    href: "/leaderboard",
    label: "Leaderboard",
    icon: ChartNoAxesColumnIncreasing,
    matches: (path: string) => path.startsWith("/leaderboard") || path.startsWith("/games/"),
  },
  { href: "/players", label: "Players", icon: Users, matches: (path: string) => path.startsWith("/players") },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottom-safe fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-xl border-t border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-3 pt-2 backdrop-blur-xl">
      <div className="grid grid-cols-3 gap-1">
        {links.map((link) => {
          const active = link.matches(pathname);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-xs font-bold transition ${active ? "bg-[var(--brand-soft)] text-[var(--brand)]" : "text-[var(--muted)]"}`}
            >
              <Icon size={20} strokeWidth={active ? 2.7 : 2} />
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
