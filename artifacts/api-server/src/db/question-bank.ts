import { db } from "@workspace/db";
import {
  questionBankTable,
  insertQuestionBankSchema,
  type InsertQuestionBank,
  type QuestionBank,
} from "@workspace/db/schema";
import { eq, like, and } from "drizzle-orm";

/**
 * Create a new question in the question bank
 */
export async function createQuestionBankItem(data: InsertQuestionBank): Promise<QuestionBank> {
  const [question] = await db.insert(questionBankTable).values(data).returning();
  return question;
}

/**
 * Get a question by ID
 */
export async function getQuestionBankItem(id: string): Promise<QuestionBank | undefined> {
  const [question] = await db
    .select()
    .from(questionBankTable)
    .where(eq(questionBankTable.id, id))
    .limit(1);
  return question;
}

/**
 * Update a question in the bank
 */
export async function updateQuestionBankItem(
  id: string,
  data: Partial<InsertQuestionBank>
): Promise<QuestionBank | undefined> {
  const [question] = await db
    .update(questionBankTable)
    .set(data)
    .where(eq(questionBankTable.id, id))
    .returning();
  return question;
}

/**
 * Delete a question from the bank
 */
export async function deleteQuestionBankItem(id: string): Promise<boolean> {
  const result = await db.delete(questionBankTable).where(eq(questionBankTable.id, id));
  return result.rowCount > 0;
}

/**
 * Filter questions from the bank
 */
export async function filterQuestionBank(filters: {
  topic?: string;
  subject?: string;
  difficulty?: string;
  type?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ questions: QuestionBank[]; total: number }> {
  const limit = filters.limit || 50;
  const offset = filters.offset || 0;

  const conditions: any[] = [];

  if (filters.topic) {
    conditions.push(eq(questionBankTable.topic, filters.topic));
  }
  if (filters.subject) {
    conditions.push(eq(questionBankTable.subject, filters.subject));
  }
  if (filters.difficulty) {
    conditions.push(eq(questionBankTable.difficulty, filters.difficulty));
  }
  if (filters.type) {
    conditions.push(eq(questionBankTable.type, filters.type));
  }
  if (filters.search) {
    conditions.push(like(questionBankTable.content, `%${filters.search}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const questions = await db
    .select()
    .from(questionBankTable)
    .where(whereClause)
    .limit(limit)
    .offset(offset);

  // Get total count for pagination
  const countResult = await db.select().from(questionBankTable).where(whereClause);
  const total = countResult.length;

  return { questions, total };
}

/**
 * Get popular questions (most used)
 */
export async function getPopularQuestions(limit = 10): Promise<QuestionBank[]> {
  return db
    .select()
    .from(questionBankTable)
    .orderBy((t) => t.usageCount)
    .limit(limit);
}

/**
 * Increment usage count for a question
 */
export async function incrementQuestionUsage(id: string): Promise<void> {
  await db
    .update(questionBankTable)
    .set({ usageCount: questionBankTable.usageCount + 1 })
    .where(eq(questionBankTable.id, id));
}
