import { describe, expect, it } from "vitest";
import { ingestRequestSchema, normalizePhoneNumber, secretsMatch } from "@/lib/ingestion";

describe("ingestion validation", () => {
  it("normalizes common US phone formats", () => {
    expect(normalizePhoneNumber("(312) 555-1234")).toBe("+13125551234");
    expect(normalizePhoneNumber("+44 20 7946 0958")).toBe("+442079460958");
    expect(normalizePhoneNumber("123")).toBeNull();
  });

  it("compares a sufficiently long bearer secret", () => {
    const secret = "0123456789abcdef0123456789abcdef";
    expect(secretsMatch(`Bearer ${secret}`, secret)).toBe(true);
    expect(secretsMatch("Bearer wrong", secret)).toBe(false);
    expect(secretsMatch(null, secret)).toBe(false);
  });

  it("validates the public ingestion shape", () => {
    expect(
      ingestRequestSchema.safeParse({
        eventId: "67651496-13cb-4a6d-9d63-030a66397b35",
        sender: "+13125551234",
        game: "GeoHistory",
        message: "GeoHistory · August 16th\n868 / 1,000",
        receivedAt: "2026-08-16T19:30:00.000Z",
      }).success,
    ).toBe(true);
  });
});
