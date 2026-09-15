// @vitest-environment node

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "@/app/api/vapi/webhook/route";
import { db } from "@/db";

vi.stubEnv("VAPI_WEBHOOK_DISABLE_AUTH", "true");
vi.stubEnv("VERCEL_ENV", "test");

vi.mock("@/db", () => ({
  db: {
    insert: vi.fn(),
    update: vi.fn(),
    select: vi.fn(),
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));
vi.mock("@/lib/services/hubrise", () => ({ pushVoiceOrderToHubrise: vi.fn() }));
vi.mock("@/lib/services/twilio-sms", () => ({ trySendOrderConfirmationSms: vi.fn() }));
vi.mock("@/lib/services/vapi-agent", () => ({ buildAssistantPayloadForCall: vi.fn() }));
vi.mock("@/lib/services/auto-rush", () => ({ applyAutoRush: vi.fn() }));
vi.mock("@/lib/services/business-hours", () => ({
  resolveCallOrderAvailability: vi.fn(() => ({ canTakeOrders: true, reason: "open", hoursState: "open" })),
}));

// Appel à 20:58 à Paris (18:58 UTC), cuisine NORMAL avec un délai de 15 à 25 min.
const NOW = new Date("2026-09-15T18:58:24.000Z");

const restaurant = {
  id: "rest-1",
  organizationId: "org-1",
  name: "Ô Pizz'Burger",
  currentStatus: "NORMAL" as const,
  statusSettings: { NORMAL: { min: 15, max: 25 } },
  hubriseAccessToken: null,
  hubriseLocationId: null,
  smsConfirmationEnabled: false,
  twilioPhoneNumber: null,
  autoRushThreshold: null,
};

function submitOrderRequest(pickupTime: string) {
  return new Request("http://localhost:3000/api/vapi/webhook?rid=rest-1", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: {
        type: "tool-calls",
        toolCallList: [
          {
            id: "call-1",
            name: "submit_order",
            arguments: {
              customer_name: "Emilie",
              items: [{ product_name: "La 4 fromages", quantity: 1, unit_price: 11.5, options: "26 cm" }],
              pickup_time: pickupTime,
              notes: "à emporter",
            },
          },
        ],
      },
    }),
  });
}

async function readResult(response: Response): Promise<Record<string, unknown>> {
  const body = (await response.json()) as { results: Array<{ result: string }> };
  return JSON.parse(body.results[0].result) as Record<string, unknown>;
}

describe("VAPI webhook — contrôle de l'heure de retrait à la soumission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([restaurant]),
    } as unknown as ReturnType<typeof db.select>);

    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockImplementation(() => ({
        returning: vi.fn().mockResolvedValue([{ id: "order-1" }]),
        then: (resolve: (v: unknown) => void) => resolve([]),
      })),
    } as unknown as ReturnType<typeof db.insert>);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("accepts the exact time the assistant proposed at the start of the call", async () => {
    // Proposition = 20:58 + 15 min = 21:13, arrondi à 21:15. Elle doit passer.
    const result = await readResult(await POST(submitOrderRequest("21:15")));

    expect(result.success).toBe(true);
    expect(db.insert).toHaveBeenCalled();
  });

  it("still accepts that proposal a few minutes later in the call", async () => {
    vi.setSystemTime(new Date(NOW.getTime() + 3 * 60_000)); // 21:01 à Paris

    const result = await readResult(await POST(submitOrderRequest("21:15")));

    expect(result.success).toBe(true);
  });

  it("rejects a time clearly too early and hands back a spoken suggestion", async () => {
    const result = await readResult(await POST(submitOrderRequest("21:00")));

    expect(result.success).toBe(false);
    expect(result.earliest_pickup_time).toBe("21:15");
    expect(result.message).toContain("vingt-et-une heures quinze");
    expect(result.message).toContain("pickup_time 21:15");
    expect(db.insert).not.toHaveBeenCalled();
  });
});
