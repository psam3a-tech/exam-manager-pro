import { pgTable, serial, text, integer, real, timestamp, pgEnum, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const questionTypeEnum = pgEnum("question_type", ["mcq", "true_false", "fill_blank", "essay", "matching", "code"]);
export const difficultyEnum = pgEnum("difficulty_level", ["easy", "medium", "hard"]);

export const questionsTable = pgTable("questions", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  type: questionTypeEnum("type").notNull(),
  courseId: integer("course_id").notNull(),
  points: real("points").notNull().default(1),
  difficulty: difficultyEnum("difficulty"),
  options: json("options").$type<string[]>(),
  correctAnswer: text("correct_answer"),
  explanation: text("explanation"),
  codeLanguage: text("code_language"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertQuestionSchema = createInsertSchema(questionsTable).omit({ id: true, createdAt: true });
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questionsTable.$inferSelect;
