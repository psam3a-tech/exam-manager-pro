import { pgTable, serial, text, integer, real, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const examStatusEnum = pgEnum("exam_status", ["draft", "published", "active", "closed"]);

export const examsTable = pgTable("exams", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  courseId: integer("course_id").notNull(),
  classId: integer("class_id"),
  status: examStatusEnum("status").notNull().default("draft"),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  passingScore: real("passing_score").notNull().default(50),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  shuffleQuestions: boolean("shuffle_questions").notNull().default(false),
  showResults: boolean("show_results").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const examQuestionsTable = pgTable("exam_questions", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id").notNull(),
  questionId: integer("question_id").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
});

export const insertExamSchema = createInsertSchema(examsTable).omit({ id: true, createdAt: true });
export type InsertExam = z.infer<typeof insertExamSchema>;
export type Exam = typeof examsTable.$inferSelect;
export type ExamQuestion = typeof examQuestionsTable.$inferSelect;
