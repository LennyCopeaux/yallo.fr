import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/dom";

afterEach(() => {
  cleanup();
});

vi.stubEnv("NODE_ENV", "test");

globalThis.fetch = vi.fn() as typeof fetch;
