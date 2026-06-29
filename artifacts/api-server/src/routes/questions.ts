import { Router } from "express";
import { db, questionsTable, coursesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import type { Request, Response } from "express";

const router = Router();

async function formatQuestion(q: typeof questionsTable.$inferSelect) {
  let courseName: string | null = null;
  const [c] = await db.select({ name: coursesTable.name }).from(coursesTable).where(eq(coursesTable.id, q.courseId)).limit(1);
  courseName = c?.name ?? null;
  return {
    id: q.id,
    text: q.text,
    type: q.type,
    courseId: q.courseId,
    courseName,
    points: q.points,
    difficulty: q.difficulty,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    codeLanguage: q.codeLanguage,
    createdAt: q.createdAt.toISOString(),
  };
}

router.get("/questions", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { courseId, type } = req.query;
  const conditions = [];
  if (courseId) conditions.push(eq(questionsTable.courseId, Number(courseId)));
  if (type) conditions.push(eq(questionsTable.type, type as string as typeof questionsTable.$inferSelect["type"]));
  const questions = await db.select().from(questionsTable).where(conditions.length > 0 ? and(...conditions) : undefined).orderBy(questionsTable.id);
  const results = await Promise.all(questions.map(formatQuestion));
  res.json(results);
});

router.post("/questions", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { text, type, courseId, points, difficulty, options, correctAnswer, explanation, codeLanguage } = req.body;
  if (!text || !type || !courseId) { res.status(400).json({ error: "text, type, courseId required" }); return; }
  const [q] = await db.insert(questionsTable).values({
    text, type, courseId, points: points ?? 1,
    difficulty: difficulty ?? null,
    options: options ?? null,
    correctAnswer: correctAnswer ?? null,
    explanation: explanation ?? null,
    codeLanguage: codeLanguage ?? null,
  }).returning();
  res.status(201).json(await formatQuestion(q));
});

router.get("/questions/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const [q] = await db.select().from(questionsTable).where(eq(questionsTable.id, id)).limit(1);
  if (!q) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await formatQuestion(q));
});

router.patch("/questions/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const { text, type, points, difficulty, options, correctAnswer, explanation, codeLanguage } = req.body;
  const updates: Partial<typeof questionsTable.$inferInsert> = {};
  if (text !== undefined) updates.text = text;
  if (type !== undefined) updates.type = type;
  if (points !== undefined) updates.points = points;
  if (difficulty !== undefined) updates.difficulty = difficulty;
  if (options !== undefined) updates.options = options;
  if (correctAnswer !== undefined) updates.correctAnswer = correctAnswer;
  if (explanation !== undefined) updates.explanation = explanation;
  if (codeLanguage !== undefined) updates.codeLanguage = codeLanguage;
  const [q] = await db.update(questionsTable).set(updates).where(eq(questionsTable.id, id)).returning();
  if (!q) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await formatQuestion(q));
});

router.delete("/questions/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  await db.delete(questionsTable).where(eq(questionsTable.id, id));
  res.status(204).send();
});

export default router;
