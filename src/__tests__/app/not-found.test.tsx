import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import NotFound from "@/app/not-found";

describe("NotFound", () => {
  it("should render 404 message", () => {
    const { container } = render(<NotFound />);

    expect(container.textContent).toContain("404");
    expect(container.textContent).toContain("La page que vous recherchez n'existe pas");
  });

  it("should render home link", () => {
    const { container } = render(<NotFound />);

    expect(container.textContent).toContain("Retour à l'accueil");
    const link = container.querySelector("a");
    expect(link).toBeTruthy();
    expect(link?.getAttribute("href")).toBe("/");
  });

  it("should have proper structure", () => {
    const { container } = render(<NotFound />);

    const h1 = container.querySelector("h1");
    expect(h1).toBeTruthy();
    expect(h1?.textContent).toContain("404");
    expect(container.querySelector("p")).toBeTruthy();
  });
});
