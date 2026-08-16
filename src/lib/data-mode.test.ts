import { afterEach, describe, expect, it } from "vitest";
import { getScoreboardDataMode } from "@/lib/data-mode";

const originalMode = process.env.SCOREBOARD_DATA_MODE;

afterEach(() => {
  if (originalMode === undefined) delete process.env.SCOREBOARD_DATA_MODE;
  else process.env.SCOREBOARD_DATA_MODE = originalMode;
});

describe("scoreboard data mode", () => {
  it("defaults to preview so a configured database cannot expose accidental test results", () => {
    delete process.env.SCOREBOARD_DATA_MODE;
    expect(getScoreboardDataMode()).toBe("preview");
  });

  it("requires an explicit live value before showing database results", () => {
    process.env.SCOREBOARD_DATA_MODE = "live";
    expect(getScoreboardDataMode()).toBe("live");
  });

  it("rejects a misspelled mode", () => {
    process.env.SCOREBOARD_DATA_MODE = "production";
    expect(() => getScoreboardDataMode()).toThrow(/preview.*live/);
  });
});
