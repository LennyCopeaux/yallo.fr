import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { FooterSection } from "@/components/landing/footer-section";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("FooterSection", () => {
  it("should render footer content", () => {
    Object.defineProperty(globalThis, "window", {
      value: {
        location: { hostname: "localhost", port: "3000" },
      },
      writable: true,
      configurable: true,
    });

    const { container } = render(<FooterSection />);

    expect(container.textContent).toBeTruthy();
  });
});
