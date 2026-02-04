import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/dom";

// Cleanup après chaque test
afterEach(() => {
  cleanup();
});

// Mock des variables d'environnement pour les tests
vi.stubEnv("NODE_ENV", "test");

// Mock global de fetch pour les tests
globalThis.fetch = vi.fn() as typeof fetch;
