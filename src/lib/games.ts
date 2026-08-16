import type { Game, GameSlug } from "@/lib/domain";

export const games: Game[] = [
  {
    id: "00000000-0000-4000-8000-000000000101",
    slug: "maptap",
    displayName: "MapTap",
    maxScore: 1000,
    higherIsBetter: true,
    displayOrder: 1,
  },
  {
    id: "00000000-0000-4000-8000-000000000102",
    slug: "pricepoint",
    displayName: "PricePoint",
    maxScore: null,
    higherIsBetter: true,
    displayOrder: 2,
  },
  {
    id: "00000000-0000-4000-8000-000000000103",
    slug: "geoevents",
    displayName: "GeoEvents",
    maxScore: 1000,
    higherIsBetter: true,
    displayOrder: 3,
  },
  {
    id: "00000000-0000-4000-8000-000000000104",
    slug: "geohistory",
    displayName: "GeoHistory",
    maxScore: 1000,
    higherIsBetter: true,
    displayOrder: 4,
  },
];

const aliases: Record<string, GameSlug> = {
  maptap: "maptap",
  maptag: "maptap",
  "map tap": "maptap",
  pricepoint: "pricepoint",
  "price point": "pricepoint",
  geoevents: "geoevents",
  "geo events": "geoevents",
  geohistory: "geohistory",
  "geo history": "geohistory",
};

export function normalizeGameSlug(value: string): GameSlug | null {
  return aliases[value.trim().toLowerCase()] ?? null;
}

export function getGameBySlug(slug: string): Game | undefined {
  return games.find((game) => game.slug === slug);
}
