import { describe, expect, it } from "vitest";
import { games, isGameScoredOn, normalizeGameSlug } from "@/lib/games";

describe("game configuration", () => {
  it("normalizes GeoSports shortcut labels", () => {
    expect(normalizeGameSlug("GeoSports")).toBe("geosports");
    expect(normalizeGameSlug("Geo Sports")).toBe("geosports");
  });

  it("scores GeoSports the same way as GeoHistory", () => {
    const geoHistory = games.find((game) => game.slug === "geohistory");
    const geoSports = games.find((game) => game.slug === "geosports");

    expect(geoSports).toMatchObject({
      maxScore: geoHistory?.maxScore,
      higherIsBetter: geoHistory?.higherIsBetter,
    });
  });

  it("starts scoring GeoSports on August 23, 2026", () => {
    const geoSports = games.find((game) => game.slug === "geosports")!;

    expect(isGameScoredOn(geoSports, "2026-08-22")).toBe(false);
    expect(isGameScoredOn(geoSports, "2026-08-23")).toBe(true);
  });
});
