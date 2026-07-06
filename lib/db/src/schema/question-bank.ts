import { pgTable, uuid, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const questionBankTable = pgTable(
  "question_bank",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    topic: text("topic").notNull(), // e.g., "Algebra", "Photosynthesis"
    subject: text("subject").notNull(),
    difficulty: text("difficulty").notNull(), // "easy", "medium", "hard"
    type: text("type").notNull(), // "mcq", "true_false", "essay", etc.
    content: text("content").notNull(),
    options: text("options"), // JSON array for MCQ
    correctAnswer: text("correct_answer"),
    explanation: text("explanation"),
    codeLanguage: text("code_language"),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    usageCount: integer("usage_count").notNull().default(0),
  },
  (t) => ([
    index("qb_topic_idx").on(t.topic),
    index("qb_subject_idx").on(t.subject),
    index("qb_difficulty_idx").on(t.difficulty),
    index("qb_type_idx").on(t.type),
    index("qb_created_by_idx").on(t.createdBy),
  ])
);

export const insertQuestionBankSchema = createInsertSchema(questionBankTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  usageCount: true,
});
export type InsertQuestionBank = z.infer<typeof insertQuestionBankSchema>;
export type QuestionBank = typeof questionBankTable.$inferSelect;
