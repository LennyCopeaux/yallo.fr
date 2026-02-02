/**
 * Rate limiting utility for API routes.
 * Protects against abuse by limiting requests per identifier.
 */

import { NextRequest } from "next/server";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

const DEFAULT_LIMIT = 10;
const DEFAULT_WINDOW_MS = 60000; // 1 minute

/**
 * Check if a request is within rate limits.
 *
 * @param identifier - Unique identifier for the requester (usually IP + path)
 * @param limit - Maximum number of requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns true if request is allowed, false if rate limited
 */
export function rateLimit(
  identifier: string,
  limit: number = DEFAULT_LIMIT,
  windowMs: number = DEFAULT_WINDOW_MS
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Get a unique identifier for rate limiting from a request.
 *
 * @param req - Next.js request object
 * @returns Unique identifier string
 */
export function getRateLimitIdentifier(req: NextRequest): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const path = req.nextUrl.pathname;
  return `${ip}:${path}`;
}

/**
 * Clean up expired rate limit records.
 * Should be called periodically to prevent memory leaks.
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}
