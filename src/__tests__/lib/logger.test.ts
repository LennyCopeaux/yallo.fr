import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "@/lib/logger";

describe("Logger", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "debug").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("info", () => {
    it("should log info messages", () => {
      logger.info("Test message");
      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("[INFO] Test message")
      );
    });

    it("should include context in info logs", () => {
      logger.info("Test message", { userId: "user-123" });
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"userId":"user-123"')
      );
    });
  });

  describe("warn", () => {
    it("should log warning messages", () => {
      logger.warn("Warning message");
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("[WARN] Warning message")
      );
    });

    it("should include context in warning logs", () => {
      logger.warn("Warning", { action: "createUser" });
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('"action":"createUser"')
      );
    });
  });

  describe("error", () => {
    it("should log error messages", () => {
      logger.error("Error message");
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("[ERROR] Error message")
      );
    });

    it("should include error details in logs", () => {
      const error = new Error("Test error");
      logger.error("Error occurred", error);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('"errorMessage":"Test error"')
      );
    });

    it("should include both error and context", () => {
      const error = new Error("Test error");
      logger.error("Error occurred", error, { userId: "user-123" });
      const call = vi.mocked(console.error).mock.calls[0][0];
      expect(call).toContain('"errorMessage":"Test error"');
      expect(call).toContain('"userId":"user-123"');
    });
  });

  describe("debug", () => {
    it("should log debug messages in development", () => {
      vi.stubEnv("NODE_ENV", "development");

      logger.debug("Debug message");
      expect(console.debug).toHaveBeenCalledTimes(1);

      vi.unstubAllEnvs();
    });

    it("should not log debug messages in production", () => {
      vi.stubEnv("NODE_ENV", "production");

      logger.debug("Debug message");
      expect(console.debug).not.toHaveBeenCalled();

      vi.unstubAllEnvs();
    });
  });

  describe("timestamp format", () => {
    it("should include ISO timestamp in logs", () => {
      logger.info("Test");
      const call = vi.mocked(console.log).mock.calls[0][0];
      // Check for ISO date format pattern
      expect(call).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });
});
