import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import ErrorPage from "@/app/error";

// Mock motion/react pour éviter les problèmes avec addEventListener dans les tests
vi.mock("motion/react", () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentPropsWithoutRef<"div">) => <div {...props}>{children}</div>,
  },
}));

vi.mock("@/components/navigation", () => ({}));

describe("ErrorPage", () => {
  const mockError = new Error("Test error");
  const mockReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
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

  it("should render error message", () => {
    const { container } = render(<ErrorPage error={mockError} reset={mockReset} />);

    expect(container.textContent).toContain("Une erreur est survenue");
    expect(container.textContent).toContain("Désolé, une erreur inattendue s'est produite");
  });

  it("should log error to console", () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);

    expect(console.error).toHaveBeenCalledWith("Application error:", mockError);
  });

  it("should render retry button", () => {
    const { container } = render(<ErrorPage error={mockError} reset={mockReset} />);

    expect(container.textContent).toContain("Réessayer");
  });

  it("should render home button", () => {
    const { container } = render(<ErrorPage error={mockError} reset={mockReset} />);

    expect(container.textContent).toContain("Retour à l'accueil");
  });

  it("should handle error with digest", () => {
    const errorWithDigest = { ...mockError, digest: "error-digest-123" };
    const { container } = render(<ErrorPage error={errorWithDigest} reset={mockReset} />);

    expect(container.textContent).toContain("Une erreur est survenue");
  });
});
