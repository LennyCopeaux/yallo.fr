import { describe, it, expect } from "vitest";
import { computeSuggestedPickupTime, resolvePrepMinutes } from "@/lib/services/pickup-time";

describe("resolvePrepMinutes", () => {
  it("uses the fixed delay of the current kitchen status", () => {
    expect(
      resolvePrepMinutes({ CALM: { fixed: 15 }, NORMAL: { min: 25, max: 35 } }, "CALM")
    ).toBe(15);
  });

  it("uses the earliest bound of a range so the assistant proposes the soonest time", () => {
    expect(resolvePrepMinutes({ NORMAL: { min: 25, max: 35 } }, "NORMAL")).toBe(25);
    expect(resolvePrepMinutes({ RUSH: { min: 45, max: 60 } }, "RUSH")).toBe(45);
  });

  it("falls back to 20 minutes when the current status has no delay", () => {
    expect(resolvePrepMinutes(null, "CALM")).toBe(20);
    expect(resolvePrepMinutes({ NORMAL: { min: 25, max: 35 } }, "CALM")).toBe(20);
  });
});

describe("computeSuggestedPickupTime", () => {
  // 12:03 UTC = 14:03 à Paris en septembre (CEST, UTC+2).
  const fourteenOhThreeParis = new Date("2026-09-13T12:03:00.000Z");

  it("adds the prep delay and rounds up to the next 5 minutes", () => {
    expect(computeSuggestedPickupTime(fourteenOhThreeParis, 15)).toBe("14:20");
    expect(computeSuggestedPickupTime(fourteenOhThreeParis, 25)).toBe("14:30");
    expect(computeSuggestedPickupTime(fourteenOhThreeParis, 45)).toBe("14:50");
  });
});
