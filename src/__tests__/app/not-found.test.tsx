import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import NotFound from "@/app/not-found";

// Mock motion/react pour éviter les problèmes avec addEventListener dans les tests
vi.mock("motion/react", () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentPropsWithoutRef<"div">) => <div {...props}>{children}</div>,
  },
}));

vi.mock("@/components/navigation", () => ({}));

describe("NotFound", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "window", {
      value: {
        location: { href: "" },
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
      writable: true,
      configurable: true,
    });
  });

  it("should render 404 message", () => {
    const { container } = render(<NotFound />);

    expect(container.textContent).toContain("404");
    expect(container.textContent).toContain("Oups, cette page n'existe pas !");
  });

  it("should render home link", () => {
    const { container } = render(<NotFound />);

    expect(container.textContent).toContain("Retour à l'accueil");
    const link = container.querySelector("a[href='/']");
    expect(link).toBeTruthy();
  });

  it("should have proper structure", () => {
    const { container } = render(<NotFound />);

    const h1 = container.querySelector("h1");
    expect(h1).toBeTruthy();
    expect(h1?.textContent).toContain("Oups, cette page n'existe pas !");
    expect(container.textContent).toContain("404");
    expect(container.querySelector("p")).toBeTruthy();
  });
});
