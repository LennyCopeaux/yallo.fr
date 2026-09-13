import { describe, it, expect } from "vitest";
import { decideAutoRush, getRushReleaseCount } from "@/lib/services/auto-rush";

describe("getRushReleaseCount", () => {
  it("releases at half the entry threshold", () => {
    expect(getRushReleaseCount(10)).toBe(5);
    expect(getRushReleaseCount(5)).toBe(2);
    expect(getRushReleaseCount(1)).toBe(0);
  });
});

describe("decideAutoRush", () => {
  it("does nothing when no threshold is configured", () => {
    expect(
      decideAutoRush({
        threshold: null,
        currentStatus: "NORMAL",
        autoRushActive: false,
        activeOrderCount: 50,
      })
    ).toEqual({ action: "none" });
  });

  it("enables RUSH when the active load reaches the threshold", () => {
    expect(
      decideAutoRush({
        threshold: 5,
        currentStatus: "NORMAL",
        autoRushActive: false,
        activeOrderCount: 5,
      })
    ).toEqual({ action: "enable_rush" });
  });

  it("stays put below the threshold", () => {
    expect(
      decideAutoRush({
        threshold: 5,
        currentStatus: "CALM",
        autoRushActive: false,
        activeOrderCount: 4,
      })
    ).toEqual({ action: "none" });
  });

  it("never overrides a STOP", () => {
    expect(
      decideAutoRush({
        threshold: 5,
        currentStatus: "STOP",
        autoRushActive: false,
        activeOrderCount: 99,
      })
    ).toEqual({ action: "none" });
  });

  it("releases an automatic RUSH once the load halves", () => {
    expect(
      decideAutoRush({
        threshold: 6,
        currentStatus: "RUSH",
        autoRushActive: true,
        activeOrderCount: 3,
      })
    ).toEqual({ action: "disable_rush", nextStatus: "NORMAL" });
  });

  it("keeps an automatic RUSH while the load stays high (hysteresis)", () => {
    expect(
      decideAutoRush({
        threshold: 6,
        currentStatus: "RUSH",
        autoRushActive: true,
        activeOrderCount: 4,
      })
    ).toEqual({ action: "none" });
  });

  it("never releases a RUSH set manually", () => {
    expect(
      decideAutoRush({
        threshold: 6,
        currentStatus: "RUSH",
        autoRushActive: false,
        activeOrderCount: 0,
      })
    ).toEqual({ action: "none" });
  });

  it("does not re-enable RUSH when already in RUSH", () => {
    expect(
      decideAutoRush({
        threshold: 5,
        currentStatus: "RUSH",
        autoRushActive: true,
        activeOrderCount: 20,
      })
    ).toEqual({ action: "none" });
  });
});
