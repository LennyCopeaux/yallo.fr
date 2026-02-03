import { NextRequest } from "next/server";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

const MAX_REQUESTS = 10;
const WINDOW_MS = 60_000;

export function rateLimit(
  identifier: string,
  limit: number = MAX_REQUESTS,
  windowMs: number = WINDOW_MS
): boolean {
  const now = Date.now();
  const existingRecord = rateLimitStore.get(identifier);

  if (!existingRecord || now > existingRecord.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (existingRecord.count >= limit) {
    return false;
  }

  existingRecord.count++;
  return true;
}

export function getRateLimitIdentifier(request: NextRequest): string {
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return `${clientIp}:${request.nextUrl.pathname}`;
}

export function cleanupExpiredRecords(): void {
  const now = Date.now();
  for (const [identifier, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(identifier);
    }
  }
}
