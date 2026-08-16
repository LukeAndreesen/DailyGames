import { describe, expect, it } from "vitest";
import { ParseError, parseResult } from "@/lib/parsers";

const receivedAt = new Date("2026-08-16T20:00:00.000Z");

describe("game share parsers", () => {
  it("parses MapTap final score and ignores round scores and comments", () => {
    const message = `www.maptap.gg August 16
99🎯 100🎯 94🏅 97🔥 97🔥
Final score: 969

Rare 900+ for Luke`;
    expect(parseResult("maptap", message, receivedAt)).toEqual({
      gameDate: "2026-08-16",
      score: 969,
      details: {},
    });
  });

  it("parses PricePoint points and uses the received date", () => {
    const message =
      "PricePoint #19\r\n🟩🟧🟨🟩🟥\r\nI got 14,262 points. Beat my score on \r\nhttps://pricepoint.gg";
    expect(parseResult("pricepoint", message, receivedAt)).toEqual({
      gameDate: "2026-08-16",
      score: 14262,
      details: { puzzleNumber: 19 },
    });
  });

  it("parses GeoEvents score rather than average distance", () => {
    const message = `GeoEvents 🌎 August 16
🟢🟢🟡🟢🟢
924 / 1,000
🎯Avg Distance: 53 miles
www.geoevents.app`;
    expect(parseResult("geoevents", message, receivedAt)).toEqual({
      gameDate: "2026-08-16",
      score: 924,
      details: { averageDistanceMiles: 53 },
    });
  });

  it("parses GeoHistory and ignores a comment containing other numbers", () => {
    const message = `GeoHistory · August 16th
868 / 1,000
📜🟡🟡🟡🟢
www.geohistory.gg

The map was not loaded for 10 seconds`;
    expect(parseResult("geohistory", message, receivedAt)).toEqual({
      gameDate: "2026-08-16",
      score: 868,
      details: {},
    });
  });

  it("uses the closest year around New Year", () => {
    const message = "GeoHistory · December 31st\n890 / 1,000\nwww.geohistory.gg";
    expect(
      parseResult(
        "geohistory",
        message,
        new Date("2027-01-01T06:30:00.000Z"),
      ).gameDate,
    ).toBe("2026-12-31");
  });

  it("rejects a message whose header does not match the selected game", () => {
    expect(() =>
      parseResult(
        "geohistory",
        "GeoEvents August 16\n900 / 1,000\nwww.geoevents.app",
        receivedAt,
      ),
    ).toThrowError(ParseError);
  });
});
