import { pgTable, serial, integer, text, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const assignmentStatusEnum = pgEnum("assignment_status", [
  "draft",
  "active",
  "closed",
]);

export const submissionStatusEnum = pgEnum("submission_status", [
  "submitted",
  "graded",
  "returned",
]);

export const assignmentsTable = pgTable("assignments", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  lecturerId: integer("lecturer_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  totalPoints: real("total_points").notNull().default(100),
  status: assignmentStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const assignmentSubmissionsTable = pgTable("assignment_submissions", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").notNull(),
  studentId: integer("student_id").notNull(),
  content: text("content"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  grade: real("grade"),
  feedback: text("feedback"),
  status: submissionStatusEnum("status").notNull().default("submitted"),
});

export const insertAssignmentSchema = createInsertSchema(assignmentsTable).omit({ id: true, createdAt: true });
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type Assignment = typeof assignmentsTable.$inferSelect;
export type AssignmentSubmission = typeof assignmentSubmissionsTable.$inferSelect;
