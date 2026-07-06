import { pgTable, uuid, integer, real, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const performanceSnapshotsTable = pgTable(
  "performance_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    examId: integer("exam_id").notNull(),
    courseId: integer("course_id"),
    totalAttempts: integer("total_attempts").notNull(),
    uniqueStudents: integer("unique_students").notNull(),
    meanScore: real("mean_score").notNull(),
    medianScore: real("median_score").notNull(),
    minScore: real("min_score").notNull(),
    maxScore: real("max_score").notNull(),
    stdDeviation: real("std_deviation").notNull(),
    passPercentage: real("pass_percentage").notNull(),
    failPercentage: real("fail_percentage").notNull(),
    scoreDistribution: text("score_distribution"), // JSON: { "0-20": 5, "20-40": 10, ... }
    takenAt: timestamp("taken_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ([
    index("ps_exam_idx").on(t.examId),
    index("ps_course_idx").on(t.courseId),
    index("ps_taken_at_idx").on(t.takenAt),
  ])
);

export const insertPerformanceSnapshotSchema = createInsertSchema(performanceSnapshotsTable).omit({
  id: true,
  takenAt: true,
});
export type InsertPerformanceSnapshot = z.infer<typeof insertPerformanceSnapshotSchema>;
export type PerformanceSnapshot = typeof performanceSnapshotsTable.$inferSelect;
