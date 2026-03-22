import { describe, it, expect } from "vitest";
import { joinStructuredOutputIds, parseStructuredOutputIds } from "@/lib/services/vapi-structured-outputs";

describe("parseStructuredOutputIds", () => {
  it("returns empty for null/undefined/blank", () => {
    expect(parseStructuredOutputIds(null)).toEqual([]);
    expect(parseStructuredOutputIds(undefined)).toEqual([]);
    expect(parseStructuredOutputIds("")).toEqual([]);
    expect(parseStructuredOutputIds("  ")).toEqual([]);
  });

  it("splits comma-separated UUIDs and trims", () => {
    expect(parseStructuredOutputIds(" id-1 , id-2 ,id-3 ")).toEqual(["id-1", "id-2", "id-3"]);
  });
});

describe("joinStructuredOutputIds", () => {
  it("joins with comma", () => {
    expect(joinStructuredOutputIds(["a", "b"])).toBe("a,b");
  });
});
