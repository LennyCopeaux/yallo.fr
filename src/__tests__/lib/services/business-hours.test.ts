import { describe, it, expect } from "vitest";
import { getBusinessHoursOpenState } from "@/lib/services/business-hours";

describe("business-hours", () => {
  it("returns closed when current day is not present in schedule", () => {
    const businessHours = JSON.stringify({
      timezone: "Europe/Paris",
      schedule: {
        monday: { open: "11:00", close: "22:00" },
      },
    });

    // 2026-05-27T18:37:00.000Z = mercredi 20:37 à Paris
    const state = getBusinessHoursOpenState(businessHours, new Date("2026-05-27T18:37:00.000Z"));

    expect(state.isConfigured).toBe(true);
    expect(state.dayKey).toBe("wednesday");
    expect(state.isOpen).toBe(false);
  });

  it("returns open when inside a valid day slot", () => {
    const businessHours = JSON.stringify({
      timezone: "Europe/Paris",
      schedule: {
        wednesday: { open: "11:00", close: "22:00" },
      },
    });

    // mercredi 20:37 à Paris
    const state = getBusinessHoursOpenState(businessHours, new Date("2026-05-27T18:37:00.000Z"));

    expect(state.isConfigured).toBe(true);
    expect(state.dayKey).toBe("wednesday");
    expect(state.isOpen).toBe(true);
  });
});
