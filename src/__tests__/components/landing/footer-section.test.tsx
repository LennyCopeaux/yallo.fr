import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FooterSection } from "@/components/landing/footer-section";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("FooterSection", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "window", {
      value: {
        location: { hostname: "localhost", port: "3000", href: "" },
      },
      writable: true,
      configurable: true,
    });
  });

  it("should render footer content", () => {
    const { container } = render(<FooterSection />);

    expect(container.textContent).toBeTruthy();
  });

  it("should render all navigation sections", () => {
    render(<FooterSection />);

    expect(screen.getByText("Produit")).toBeTruthy();
    expect(screen.getByText("Légal")).toBeTruthy();
    expect(screen.getByText("Contact")).toBeTruthy();
    expect(screen.getByText("Ressources")).toBeTruthy();
  });

  it("should render Yallo branding", () => {
    render(<FooterSection />);

    expect(screen.getByText("Yallo")).toBeTruthy();
    expect(screen.getByText(/Tous droits réservés/)).toBeTruthy();
  });

  it("should redirect to localhost app on login click in dev", () => {
    render(<FooterSection />);

    const loginButton = screen.getByText("Connexion");
    fireEvent.click(loginButton);

    expect(globalThis.window.location.href).toBe("http://app.localhost:3000/login");
  });

  it("should redirect to staging app on login click in staging", () => {
    Object.defineProperty(globalThis, "window", {
      value: {
        location: { hostname: "staging.yallo.fr", port: "", href: "" },
      },
      writable: true,
      configurable: true,
    });

    render(<FooterSection />);

    const loginButton = screen.getByText("Connexion");
    fireEvent.click(loginButton);

    expect(globalThis.window.location.href).toBe("https://app.staging.yallo.fr/login");
  });

  it("should redirect to production app on login click in production", () => {
    Object.defineProperty(globalThis, "window", {
      value: {
        location: { hostname: "yallo.fr", port: "", href: "" },
      },
      writable: true,
      configurable: true,
    });

    render(<FooterSection />);

    const loginButton = screen.getByText("Connexion");
    fireEvent.click(loginButton);

    expect(globalThis.window.location.href).toBe("https://app.yallo.fr/login");
  });
});
