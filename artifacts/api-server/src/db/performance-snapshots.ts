import { db } from "@workspace/db";
import { performanceSnapshotsTable, insertPerformanceSnapshotSchema, type InsertPerformanceSnapshot } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

/**
 * Save a performance snapshot for an exam
 */
export async function savePerformanceSnapshot(data: InsertPerformanceSnapshot) {
  const [snapshot] = await db.insert(performanceSnapshotsTable).values(data).returning();
  return snapshot;
}

/**
 * Get latest snapshot for an exam
 */
export async function getLatestExamSnapshot(examId: number) {
  const [snapshot] = await db
    .select()
    .from(performanceSnapshotsTable)
    .where(eq(performanceSnapshotsTable.examId, examId))
    .orderBy((t) => t.takenAt)
    .limit(1);
  return snapshot;
}

/**
 * Get all snapshots for an exam (for trend analysis)
 */
export async function getExamSnapshotHistory(examId: number) {
  return db
    .select()
    .from(performanceSnapshotsTable)
    .where(eq(performanceSnapshotsTable.examId, examId))
    .orderBy((t) => t.takenAt);
}
