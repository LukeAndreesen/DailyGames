import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";

type ReplayHelpers = {
  canonicalGame_: (value: string) => string;
  deterministicEventId_: (input: {
    sender: string;
    game: string;
    message: string;
  }) => string;
  samePayload_: (row: unknown[], input: { sender: string; game: string; message: string }) => boolean;
};

function loadReplayHelpers(): ReplayHelpers {
  const context = {
    Utilities: {
      DigestAlgorithm: { SHA_256: "SHA_256" },
      Charset: { UTF_8: "UTF_8" },
      computeDigest: (_algorithm: string, value: string) =>
        [...createHash("sha256").update(value, "utf8").digest()].map((byte) =>
          byte > 127 ? byte - 256 : byte,
        ),
    },
  } as Record<string, unknown>;
  runInNewContext(readFileSync(new URL("./Code.gs", import.meta.url), "utf8"), context);
  return context as unknown as ReplayHelpers;
}

describe("Apps Script reconciliation identity", () => {
  const helpers = loadReplayHelpers();
  const message = `www.maptap.gg August 16
99🎯 100🎯 94🏅 97🔥 97🔥
Final score: 969`;

  it("creates the same UUID for equivalent live and reconciliation payloads", () => {
    const liveId = helpers.deterministicEventId_({
      sender: "13125550199",
      game: "MapTag",
      message: message.replace(/\n/g, "\r\n"),
    });
    const reconciliationId = helpers.deterministicEventId_({
      sender: "+1 (312) 555-0199",
      game: "MapTap",
      message: `  ${message}\n`,
    });

    expect(liveId).toBe(reconciliationId);
    expect(liveId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-8[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("matches legacy Sheet rows by canonical payload instead of their random event ID", () => {
    const legacyRow = [
      "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
      "2026-08-16T23:46:29.094Z",
      "13125550199",
      "MapTag",
      message,
    ];

    expect(
      helpers.samePayload_(legacyRow, {
        sender: "+1 312 555 0199",
        game: "MapTap",
        message: `${message}\r\n`,
      }),
    ).toBe(true);
  });

  it("uses different IDs for genuinely different score messages", () => {
    const first = helpers.deterministicEventId_({ sender: "13125550199", game: "MapTag", message });
    const second = helpers.deterministicEventId_({
      sender: "13125550199",
      game: "MapTag",
      message: message.replace("969", "970"),
    });

    expect(first).not.toBe(second);
    expect(helpers.canonicalGame_("MapTag")).toBe("maptap");
  });
});
