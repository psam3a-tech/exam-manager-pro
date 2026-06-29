import { pgTable, serial, integer, real, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const attemptStatusEnum = pgEnum("attempt_status", ["in_progress", "submitted", "graded"]);
export const gradingStatusEnum = pgEnum("grading_status", ["auto_graded", "pending_manual", "fully_graded"]);

export const attemptsTable = pgTable("attempts", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  examId: integer("exam_id").notNull(),
  status: attemptStatusEnum("status").notNull().default("in_progress"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  submittedAt: timestamp("submitted_at"),
});

export const attemptAnswersTable = pgTable("attempt_answers", {
  id: serial("id").primaryKey(),
  attemptId: integer("attempt_id").notNull(),
  questionId: integer("question_id").notNull(),
  answer: text("answer"),
  pointsEarned: real("points_earned"),
  isCorrect: integer("is_correct"),
  feedback: text("feedback"),
  savedAt: timestamp("saved_at").notNull().defaultNow(),
});

export const resultsTable = pgTable("results", {
  id: serial("id").primaryKey(),
  attemptId: integer("attempt_id").notNull(),
  studentId: integer("student_id").notNull(),
  examId: integer("exam_id").notNull(),
  score: real("score").notNull().default(0),
  totalPoints: real("total_points").notNull().default(0),
  percentage: real("percentage").notNull().default(0),
  isPassed: integer("is_passed").notNull().default(0),
  gradingStatus: gradingStatusEnum("grading_status").notNull().default("auto_graded"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAttemptSchema = createInsertSchema(attemptsTable).omit({ id: true, startedAt: true });
export type InsertAttempt = z.infer<typeof insertAttemptSchema>;
export type Attempt = typeof attemptsTable.$inferSelect;
export type AttemptAnswer = typeof attemptAnswersTable.$inferSelect;
export type Result = typeof resultsTable.$inferSelect;
