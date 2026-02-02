import { describe, it, expect } from "vitest";

describe("Admin Queries - Search Sanitization", () => {
  function sanitizeSearchPattern(search: string): string {
    const sanitized = search.replace(/[%_]/g, "");
    return `%${sanitized}%`;
  }

  it("should sanitize SQL wildcards from search input", () => {
    expect(sanitizeSearchPattern("test%injection")).toBe("%testinjection%");
    expect(sanitizeSearchPattern("test_injection")).toBe("%testinjection%");
    expect(sanitizeSearchPattern("%_%")).toBe("%%");
  });

  it("should handle normal search strings", () => {
    expect(sanitizeSearchPattern("restaurant")).toBe("%restaurant%");
    expect(sanitizeSearchPattern("kebab house")).toBe("%kebab house%");
  });

  it("should handle empty search string", () => {
    expect(sanitizeSearchPattern("")).toBe("%%");
  });

  it("should handle special characters that are not SQL wildcards", () => {
    expect(sanitizeSearchPattern("l'étoile")).toBe("%l'étoile%");
    expect(sanitizeSearchPattern("café & co")).toBe("%café & co%");
  });
});

describe("Admin Queries - Status Validation", () => {
  const validStatuses = ["active", "suspended", "onboarding"];

  function isValidStatus(status: string): boolean {
    return validStatuses.includes(status);
  }

  it("should accept valid statuses", () => {
    expect(isValidStatus("active")).toBe(true);
    expect(isValidStatus("suspended")).toBe(true);
    expect(isValidStatus("onboarding")).toBe(true);
  });

  it("should reject invalid statuses", () => {
    expect(isValidStatus("invalid")).toBe(false);
    expect(isValidStatus("ACTIVE")).toBe(false);
    expect(isValidStatus("")).toBe(false);
  });
});
