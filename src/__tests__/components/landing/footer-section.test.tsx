import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { FooterSection } from "@/components/landing/footer-section";

describe("FooterSection", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "window", {
      value: {
        location: { hostname: "localhost", port: "3000" },
      },
      writable: true,
    });
  });

  it("should render footer content", () => {
    const { container } = render(<FooterSection />);

    expect(container.textContent).toBeTruthy();
  });

  it("should handle localhost environment", () => {
    Object.defineProperty(globalThis, "window", {
      value: {
        location: { hostname: "localhost", port: "3000" },
      },
      writable: true,
    });

    const { container } = render(<FooterSection />);

    expect(container).toBeTruthy();
  });

  it("should handle staging environment", () => {
    Object.defineProperty(globalThis, "window", {
      value: {
        location: { hostname: "staging.yallo.fr" },
      },
      writable: true,
    });

    const { container } = render(<FooterSection />);

    expect(container).toBeTruthy();
  });

  it("should handle production environment", () => {
    Object.defineProperty(globalThis, "window", {
      value: {
        location: { hostname: "yallo.fr" },
      },
      writable: true,
    });

    const { container } = render(<FooterSection />);

    expect(container).toBeTruthy();
  });
});
