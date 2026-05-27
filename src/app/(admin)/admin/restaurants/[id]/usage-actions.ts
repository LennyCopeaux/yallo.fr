"use server";

import { db } from "@/db";
import { callLogs } from "@/db/schema";
import { eq, sql, and, gte } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function getRestaurantCallStats(restaurantId: string) {
  await requireAdmin();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [allTime, last30Days] = await Promise.all([
    db
      .select({
        callCount: sql<number>`COUNT(*)`,
        totalSeconds: sql<number>`COALESCE(SUM(${callLogs.durationSeconds}), 0)`,
        avgSeconds: sql<number>`COALESCE(AVG(${callLogs.durationSeconds}), 0)`,
      })
      .from(callLogs)
      .where(eq(callLogs.restaurantId, restaurantId))
      .then((r) => r[0] ?? { callCount: 0, totalSeconds: 0, avgSeconds: 0 }),
    db
      .select({
        callCount: sql<number>`COUNT(*)`,
        totalSeconds: sql<number>`COALESCE(SUM(${callLogs.durationSeconds}), 0)`,
      })
      .from(callLogs)
      .where(
        and(eq(callLogs.restaurantId, restaurantId), gte(callLogs.startedAt, thirtyDaysAgo))
      )
      .then((r) => r[0] ?? { callCount: 0, totalSeconds: 0 }),
  ]);

  return {
    allTime: {
      callCount: Number(allTime.callCount),
      totalMinutes: Math.round(Number(allTime.totalSeconds) / 60),
      avgSeconds: Math.round(Number(allTime.avgSeconds)),
    },
    last30Days: {
      callCount: Number(last30Days.callCount),
      totalMinutes: Math.round(Number(last30Days.totalSeconds) / 60),
    },
  };
}
