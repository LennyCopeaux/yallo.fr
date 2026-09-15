import { describe, it, expect } from "vitest";
import {
  computeSuggestedPickupTime,
  formatParisTime,
  formatSpokenFrenchTime,
  parsePickupTimeInParis,
  resolvePrepMinutes,
} from "@/lib/services/pickup-time";

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

describe("formatSpokenFrenchTime", () => {
  it("writes dinner times in letters so the TTS cannot say euro", () => {
    expect(formatSpokenFrenchTime("19:05")).toBe("dix-neuf heures cinq");
    expect(formatSpokenFrenchTime("19:00")).toBe("dix-neuf heures");
    expect(formatSpokenFrenchTime("18:40")).toBe("dix-huit heures quarante");
    expect(formatSpokenFrenchTime("12:05")).toBe("midi cinq");
  });
});

describe("parsePickupTimeInParis", () => {
  // Appel à 17:49 à Paris (15:49 UTC) un jour d'été : le client demande 19h30.
  const callAtSeventeenFortyNineParis = new Date("2026-09-14T15:49:00.000Z");

  it("interprets HH:MM as Paris time whatever the server timezone", () => {
    const pickup = parsePickupTimeInParis("19:30", callAtSeventeenFortyNineParis);
    expect(pickup?.toISOString()).toBe("2026-09-14T17:30:00.000Z");
    expect(formatParisTime(pickup!)).toBe("19:30");
  });

  it("uses the winter offset when Paris is on CET", () => {
    const winterCall = new Date("2026-01-12T11:00:00.000Z"); // 12:00 à Paris
    const pickup = parsePickupTimeInParis("12:45", winterCall);
    expect(pickup?.toISOString()).toBe("2026-01-12T11:45:00.000Z");
    expect(formatParisTime(pickup!)).toBe("12:45");
  });

  it("rolls over to the next day when the time is already past in Paris", () => {
    // 23:30 à Paris (21:30 UTC) : « 00:15 » est demain.
    const lateCall = new Date("2026-09-14T21:30:00.000Z");
    const pickup = parsePickupTimeInParis("00:15", lateCall);
    expect(pickup?.toISOString()).toBe("2026-09-14T22:15:00.000Z");
  });

  it("does not roll over when the time is still ahead in Paris even if past in UTC", () => {
    // 01:10 à Paris = 23:10 UTC la veille. « 01:30 » est dans 20 minutes.
    const afterMidnightParis = new Date("2026-09-14T23:10:00.000Z");
    const pickup = parsePickupTimeInParis("01:30", afterMidnightParis);
    expect(pickup?.toISOString()).toBe("2026-09-14T23:30:00.000Z");
  });

  it("rejects malformed or impossible times", () => {
    expect(parsePickupTimeInParis(undefined)).toBeNull();
    expect(parsePickupTimeInParis("19h30")).toBeNull();
    expect(parsePickupTimeInParis("25:00")).toBeNull();
    expect(parsePickupTimeInParis("19:75")).toBeNull();
  });
});
