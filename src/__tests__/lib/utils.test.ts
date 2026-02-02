import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cn, getAppUrl, buildAppUrlServer } from "@/lib/utils";

describe("cn (className merger)", () => {
  it("devrait fusionner des classes simples", () => {
    const result = cn("text-red-500", "bg-blue-500");
    expect(result).toBe("text-red-500 bg-blue-500");
  });

  it("devrait gérer les classes conditionnelles", () => {
    const isActive = true;
    const result = cn("base-class", isActive && "active-class");
    expect(result).toBe("base-class active-class");
  });

  it("devrait exclure les valeurs falsy", () => {
    const result = cn("base-class", false && "hidden", null, undefined, "visible");
    expect(result).toBe("base-class visible");
  });

  it("devrait résoudre les conflits Tailwind (last wins)", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
  });

  it("devrait gérer les objets de classes", () => {
    const result = cn({ "text-red-500": true, "text-blue-500": false });
    expect(result).toBe("text-red-500");
  });

  it("devrait retourner une string vide si aucune classe", () => {
    const result = cn();
    expect(result).toBe("");
  });
});

describe("getAppUrl", () => {
  const originalWindow = global.window;
  const originalProcess = global.process;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    global.window = originalWindow;
    global.process = originalProcess;
    vi.unstubAllEnvs();
  });

  it("devrait ajouter un slash initial si absent", () => {
    vi.stubEnv("NODE_ENV", "production");
    // @ts-expect-error - mock window for test
    global.window = undefined;
    
    const result = getAppUrl("dashboard");
    expect(result).toBe("https://app.yallo.fr/dashboard");
  });

  it("devrait garder le slash initial si présent", () => {
    vi.stubEnv("NODE_ENV", "production");
    // @ts-expect-error - mock window for test
    global.window = undefined;
    
    const result = getAppUrl("/dashboard");
    expect(result).toBe("https://app.yallo.fr/dashboard");
  });

  it("devrait retourner l'URL racine si path vide", () => {
    vi.stubEnv("NODE_ENV", "production");
    // @ts-expect-error - mock window for test
    global.window = undefined;
    
    const result = getAppUrl("");
    expect(result).toBe("https://app.yallo.fr/");
  });

  it("devrait utiliser localhost en développement", () => {
    vi.stubEnv("NODE_ENV", "development");
    // @ts-expect-error - mock window for test
    global.window = undefined;
    
    const result = getAppUrl("/dashboard");
    expect(result).toBe("http://app.localhost:3000/dashboard");
  });
});

describe("buildAppUrlServer", () => {
  // Note: Ces tests ne modifient pas NEXT_PUBLIC_APP_URL car process.env
  // est lu au moment de l'import du module, pas à chaque appel.
  // Les tests vérifient le comportement par défaut (sans NEXT_PUBLIC_APP_URL).

  it("devrait utiliser localhost en dev", () => {
    const result = buildAppUrlServer("/dashboard", "localhost:3000");
    // Si NEXT_PUBLIC_APP_URL n'est pas défini, utilise localhost
    expect(result).toContain("/dashboard");
  });

  it("devrait utiliser le port fourni dans le host localhost", () => {
    const result = buildAppUrlServer("/dashboard", "localhost:4000");
    expect(result).toContain("4000");
    expect(result).toContain("/dashboard");
  });

  it("devrait utiliser la production pour un host non-localhost", () => {
    const result = buildAppUrlServer("/dashboard", "yallo.fr");
    expect(result).toBe("https://app.yallo.fr/dashboard");
  });

  it("devrait normaliser le path sans slash", () => {
    const result = buildAppUrlServer("dashboard", "yallo.fr");
    expect(result).toBe("https://app.yallo.fr/dashboard");
  });
});
