import { describe, it, expect } from "vitest";

describe("StatusDelayConfig Type", () => {
  type StatusType = "CALM" | "NORMAL" | "RUSH";

  it("should accept valid status types", () => {
    const statuses: StatusType[] = ["CALM", "NORMAL", "RUSH"];

    expect(statuses).toHaveLength(3);
    expect(statuses).toContain("CALM");
    expect(statuses).toContain("NORMAL");
    expect(statuses).toContain("RUSH");
  });

  it("should reject invalid status types", () => {
    const validStatuses: StatusType[] = ["CALM", "NORMAL", "RUSH"];

    expect(validStatuses).not.toContain("STOP");
    expect(validStatuses).not.toContain("INVALID");
  });
});
