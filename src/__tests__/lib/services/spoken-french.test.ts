import { describe, it, expect } from "vitest";
import { toSpokenFrenchLabel } from "@/lib/services/spoken-french";

describe("toSpokenFrenchLabel", () => {
  it("rewrites Burger King so the TTS stays in French", () => {
    expect(toSpokenFrenchLabel("Burger King Pessac")).toBe("Beurger Kingue Pessac");
  });

  it("leaves an unknown French name untouched", () => {
    expect(toSpokenFrenchLabel("Chez Léon")).toBe("Chez Léon");
  });
});
