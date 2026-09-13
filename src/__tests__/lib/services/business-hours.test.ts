import { describe, it, expect } from "vitest";
import {
  getBusinessHoursOpenState,
  resolveCallOrderAvailability,
  resolveAssistantFirstMessage,
  buildHoursStatusLineForPrompt,
} from "@/lib/services/business-hours";

describe("business-hours", () => {
  it("returns closed when current day is not present in schedule", () => {
    const businessHours = JSON.stringify({
      timezone: "Europe/Paris",
      schedule: {
        monday: { open: "11:00", close: "22:00" },
      },
    });

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

    const state = getBusinessHoursOpenState(businessHours, new Date("2026-05-27T18:37:00.000Z"));

    expect(state.isConfigured).toBe(true);
    expect(state.dayKey).toBe("wednesday");
    expect(state.isOpen).toBe(true);
  });

  it("treats missing hours as unconfigured and open (fail-open)", () => {
    const state = getBusinessHoursOpenState(null, new Date("2026-05-27T18:37:00.000Z"));

    expect(state.isConfigured).toBe(false);
    expect(state.isOpen).toBe(true);
  });

  it("treats invalid JSON hours as unconfigured", () => {
    const state = getBusinessHoursOpenState("{not-json", new Date("2026-05-27T18:37:00.000Z"));

    expect(state.isConfigured).toBe(false);
    expect(state.isOpen).toBe(true);
  });

  it("resolveCallOrderAvailability blocks when hours are closed", () => {
    const businessHours = JSON.stringify({
      timezone: "Europe/Paris",
      schedule: {
        monday: { open: "11:00", close: "22:00" },
      },
    });

    const availability = resolveCallOrderAvailability(
      {
        name: "Chez Test",
        businessHours,
        currentStatus: "CALM",
      },
      new Date("2026-05-27T18:37:00.000Z")
    );

    expect(availability.canTakeOrders).toBe(false);
    expect(availability.reason).toBe("closed_hours");
  });

  it("resolveCallOrderAvailability allows orders when hours are missing", () => {
    const availability = resolveCallOrderAvailability(
      {
        name: "Chez Test",
        businessHours: null,
        currentStatus: "CALM",
      },
      new Date("2026-05-27T18:37:00.000Z")
    );

    expect(availability.canTakeOrders).toBe(true);
    expect(availability.reason).toBe("hours_unconfigured");
  });

  it("resolveCallOrderAvailability blocks on STOP even if hours open", () => {
    const businessHours = JSON.stringify({
      timezone: "Europe/Paris",
      schedule: {
        wednesday: { open: "11:00", close: "22:00" },
      },
    });

    const availability = resolveCallOrderAvailability(
      {
        name: "Chez Test",
        businessHours,
        currentStatus: "STOP",
        statusSettings: { STOP: { message: "Cuisine fermée pour aujourd'hui." } },
      },
      new Date("2026-05-27T18:37:00.000Z")
    );

    expect(availability.canTakeOrders).toBe(false);
    expect(availability.reason).toBe("stop");
  });

  it("resolveCallOrderAvailability blocks a suspended restaurant even during opening hours", () => {
    const businessHours = JSON.stringify({
      timezone: "Europe/Paris",
      schedule: {
        wednesday: { open: "11:00", close: "22:00" },
      },
    });

    const availability = resolveCallOrderAvailability(
      {
        name: "Chez Test",
        businessHours,
        currentStatus: "CALM",
        isActive: false,
        status: "suspended",
      },
      new Date("2026-05-27T18:37:00.000Z")
    );

    expect(availability.canTakeOrders).toBe(false);
    expect(availability.reason).toBe("suspended");
  });

  it("resolveCallOrderAvailability keeps an onboarding restaurant usable", () => {
    const availability = resolveCallOrderAvailability(
      {
        name: "Chez Test",
        businessHours: null,
        currentStatus: "CALM",
        isActive: true,
        status: "onboarding",
      },
      new Date("2026-05-27T18:37:00.000Z")
    );

    expect(availability.canTakeOrders).toBe(true);
  });

  it("suspended first message stays neutral about billing", () => {
    const availability = resolveCallOrderAvailability(
      {
        name: "Chez Test",
        businessHours: null,
        currentStatus: "CALM",
        isActive: false,
      },
      new Date("2026-05-27T18:37:00.000Z")
    );

    const firstMessage = resolveAssistantFirstMessage(
      {
        name: "Chez Test",
        businessHours: null,
        currentStatus: "CALM",
        welcomeMessage: "Bienvenue, je vous écoute",
      },
      availability
    );

    expect(firstMessage).toContain("indisponible");
    expect(firstMessage).not.toMatch(/abonnement|paiement|facture/i);
  });

  it("resolveAssistantFirstMessage announces closure when closed", () => {
    const availability = resolveCallOrderAvailability(
      {
        name: "Chez Test",
        businessHours: JSON.stringify({
          timezone: "Europe/Paris",
          schedule: { monday: { open: "11:00", close: "22:00" } },
        }),
        currentStatus: "CALM",
        welcomeMessage: "Bienvenue, je vous écoute",
      },
      new Date("2026-05-27T18:37:00.000Z")
    );

    const firstMessage = resolveAssistantFirstMessage(
      {
        name: "Chez Test",
        businessHours: null,
        currentStatus: "CALM",
        welcomeMessage: "Bienvenue, je vous écoute",
      },
      availability
    );

    expect(firstMessage).toContain("fermés");
    expect(firstMessage).not.toContain("Bienvenue");
  });

  it("buildHoursStatusLineForPrompt marks unconfigured hours clearly", () => {
    const line = buildHoursStatusLineForPrompt(null);
    expect(line).toContain("NON_CONFIGURE");
  });
});
