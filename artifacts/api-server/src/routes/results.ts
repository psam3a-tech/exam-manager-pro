import { Router } from "express";
import { db, resultsTable, attemptsTable, attemptAnswersTable, questionsTable, usersTable, examsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import type { Request, Response } from "express";

const router = Router();

async function formatResult(r: typeof resultsTable.$inferSelect) {
  const [s] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, r.studentId)).limit(1);
  const [e] = await db.select({ title: examsTable.title }).from(examsTable).where(eq(examsTable.id, r.examId)).limit(1);
  return {
    id: r.id,
    attemptId: r.attemptId,
    studentId: r.studentId,
    studentName: s?.name ?? null,
    examId: r.examId,
    examTitle: e?.title ?? null,
    score: r.score,
    totalPoints: r.totalPoints,
    percentage: r.percentage,
    isPassed: r.isPassed === 1,
    gradingStatus: r.gradingStatus,
    createdAt: r.createdAt.toISOString(),
  };
}

router.get("/results", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { studentId, examId } = req.query;
  const conditions = [];
  if (studentId) conditions.push(eq(resultsTable.studentId, Number(studentId)));
  if (examId) conditions.push(eq(resultsTable.examId, Number(examId)));
  const rows = await db.select().from(resultsTable).where(conditions.length > 0 ? and(...conditions) : undefined).orderBy(resultsTable.createdAt);
  const results = await Promise.all(rows.map(formatResult));
  res.json(results);
});

router.get("/results/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const [r] = await db.select().from(resultsTable).where(eq(resultsTable.id, id)).limit(1);
  if (!r) { res.status(404).json({ error: "Not found" }); return; }

  const [exam] = await db.select().from(examsTable).where(eq(examsTable.id, r.examId)).limit(1);
  const answers = await db.select().from(attemptAnswersTable).where(eq(attemptAnswersTable.attemptId, r.attemptId));

  const answerDetails = await Promise.all(answers.map(async (a) => {
    const [q] = await db.select().from(questionsTable).where(eq(questionsTable.id, a.questionId)).limit(1);
    return {
      questionId: a.questionId,
      questionText: q?.text ?? "",
      questionType: q?.type ?? "",
      studentAnswer: a.answer,
      correctAnswer: exam?.showResults ? q?.correctAnswer ?? null : null,
      pointsEarned: a.pointsEarned ?? 0,
      maxPoints: q?.points ?? 0,
      isCorrect: a.isCorrect != null ? Boolean(a.isCorrect) : null,
      feedback: a.feedback,
    };
  }));

  const base = await formatResult(r);
  res.json({ ...base, answers: answerDetails });
});

router.patch("/results/:id/grade", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const { answers } = req.body as { answers: Array<{ questionId: number; pointsEarned: number; feedback?: string }> };
  const [r] = await db.select().from(resultsTable).where(eq(resultsTable.id, id)).limit(1);
  if (!r) { res.status(404).json({ error: "Not found" }); return; }

  for (const grade of answers) {
    await db.update(attemptAnswersTable).set({
      pointsEarned: grade.pointsEarned,
      isCorrect: grade.pointsEarned > 0 ? 1 : 0,
      feedback: grade.feedback ?? null,
    }).where(and(eq(attemptAnswersTable.attemptId, r.attemptId), eq(attemptAnswersTable.questionId, grade.questionId)));
  }

  const allAnswers = await db.select().from(attemptAnswersTable).where(eq(attemptAnswersTable.attemptId, r.attemptId));
  const newScore = allAnswers.reduce((sum, a) => sum + (a.pointsEarned ?? 0), 0);
  const percentage = r.totalPoints > 0 ? (newScore / r.totalPoints) * 100 : 0;
  const [exam] = await db.select().from(examsTable).where(eq(examsTable.id, r.examId)).limit(1);
  const isPassed = percentage >= (exam?.passingScore ?? 50) ? 1 : 0;

  const [updated] = await db.update(resultsTable).set({
    score: newScore, percentage, isPassed, gradingStatus: "fully_graded",
  }).where(eq(resultsTable.id, id)).returning();

  res.json(await formatResult(updated));
});

export default router;
