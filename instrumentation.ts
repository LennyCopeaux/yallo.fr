export async function register() {
  // Skip Sentry entirely in local/dev — avoids OpenTelemetry webpack spam + slow compiles.
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export async function onRequestError(
  ...args: Parameters<
    typeof import("@sentry/nextjs").captureRequestError
  >
) {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const Sentry = await import("@sentry/nextjs");
  return Sentry.captureRequestError(...args);
}
