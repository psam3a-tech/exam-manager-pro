import { Router } from "express";
import { db, attemptsTable, attemptAnswersTable, resultsTable, examsTable, examQuestionsTable, questionsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import type { Request, Response } from "express";
import type { AuthPayload } from "../middlewares/auth";

const router = Router();

function formatAttempt(a: typeof attemptsTable.$inferSelect, studentName?: string | null, examTitle?: string | null) {
  return {
    id: a.id,
    studentId: a.studentId,
    studentName: studentName ?? null,
    examId: a.examId,
    examTitle: examTitle ?? null,
    status: a.status,
    score: null,
    startedAt: a.startedAt.toISOString(),
    submittedAt: a.submittedAt?.toISOString() ?? null,
  };
}

router.get("/attempts", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { studentId, examId } = req.query;
  const conditions = [];
  if (studentId) conditions.push(eq(attemptsTable.studentId, Number(studentId)));
  if (examId) conditions.push(eq(attemptsTable.examId, Number(examId)));
  const rows = await db.select().from(attemptsTable).where(conditions.length > 0 ? and(...conditions) : undefined).orderBy(attemptsTable.startedAt);
  const results = await Promise.all(rows.map(async (a) => {
    const [s] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, a.studentId)).limit(1);
    const [e] = await db.select({ title: examsTable.title }).from(examsTable).where(eq(examsTable.id, a.examId)).limit(1);
    const [result] = await db.select().from(resultsTable).where(eq(resultsTable.attemptId, a.id)).limit(1);
    return { ...formatAttempt(a, s?.name, e?.title), score: result?.score ?? null };
  }));
  res.json(results);
});

router.post("/attempts", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const authUser = (req as Request & { user: AuthPayload }).user;
  const { examId } = req.body;
  if (!examId) { res.status(400).json({ error: "examId required" }); return; }
  const [exam] = await db.select().from(examsTable).where(eq(examsTable.id, examId)).limit(1);
  if (!exam) { res.status(404).json({ error: "Exam not found" }); return; }

  const [attempt] = await db.insert(attemptsTable).values({
    studentId: authUser.userId, examId, status: "in_progress",
  }).returning();

  const eqs = await db.select().from(examQuestionsTable).where(eq(examQuestionsTable.examId, examId)).orderBy(examQuestionsTable.orderIndex);
  let questionsList = await Promise.all(eqs.map(async (eq2) => {
    const [q] = await db.select().from(questionsTable).where(eq(questionsTable.id, eq2.questionId)).limit(1);
    if (!q) return null;
    return {
      id: eq2.id,
      questionId: q.id,
      text: q.text,
      type: q.type,
      options: q.type === "mcq" || q.type === "matching" ? q.options : null,
      points: q.points,
      studentAnswer: null,
      codeLanguage: q.codeLanguage,
    };
  }));

  if (exam.shuffleQuestions) {
    questionsList = questionsList.sort(() => Math.random() - 0.5);
  }

  res.status(201).json({
    id: attempt.id,
    studentId: attempt.studentId,
    examId: attempt.examId,
    examTitle: exam.title,
    durationMinutes: exam.durationMinutes,
    status: attempt.status,
    startedAt: attempt.startedAt.toISOString(),
    submittedAt: null,
    questions: questionsList.filter(Boolean),
  });
});

router.get("/attempts/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const [attempt] = await db.select().from(attemptsTable).where(eq(attemptsTable.id, id)).limit(1);
  if (!attempt) { res.status(404).json({ error: "Not found" }); return; }
  const [exam] = await db.select().from(examsTable).where(eq(examsTable.id, attempt.examId)).limit(1);
  const eqs = await db.select().from(examQuestionsTable).where(eq(examQuestionsTable.examId, attempt.examId)).orderBy(examQuestionsTable.orderIndex);
  const savedAnswers = await db.select().from(attemptAnswersTable).where(eq(attemptAnswersTable.attemptId, id));

  const questions = await Promise.all(eqs.map(async (eq2) => {
    const [q] = await db.select().from(questionsTable).where(eq(questionsTable.id, eq2.questionId)).limit(1);
    if (!q) return null;
    const savedAnswer = savedAnswers.find(a => a.questionId === q.id);
    return {
      id: eq2.id,
      questionId: q.id,
      text: q.text,
      type: q.type,
      options: q.type === "mcq" || q.type === "matching" ? q.options : null,
      points: q.points,
      studentAnswer: savedAnswer?.answer ?? null,
      codeLanguage: q.codeLanguage,
    };
  }));

  res.json({
    id: attempt.id,
    studentId: attempt.studentId,
    examId: attempt.examId,
    examTitle: exam?.title ?? null,
    durationMinutes: exam?.durationMinutes ?? 60,
    status: attempt.status,
    startedAt: attempt.startedAt.toISOString(),
    submittedAt: attempt.submittedAt?.toISOString() ?? null,
    questions: questions.filter(Boolean),
  });
});

router.post("/attempts/:id/answer", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const attemptId = Number(req.params.id);
  const { questionId, answer } = req.body;
  if (!questionId) { res.status(400).json({ error: "questionId required" }); return; }

  const existing = await db.select().from(attemptAnswersTable)
    .where(and(eq(attemptAnswersTable.attemptId, attemptId), eq(attemptAnswersTable.questionId, questionId)));

  if (existing.length > 0) {
    await db.update(attemptAnswersTable).set({ answer, savedAt: new Date() })
      .where(and(eq(attemptAnswersTable.attemptId, attemptId), eq(attemptAnswersTable.questionId, questionId)));
  } else {
    await db.insert(attemptAnswersTable).values({ attemptId, questionId, answer });
  }
  res.json({ success: true });
});

router.post("/attempts/:id/submit", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const attemptId = Number(req.params.id);
  const [attempt] = await db.select().from(attemptsTable).where(eq(attemptsTable.id, attemptId)).limit(1);
  if (!attempt) { res.status(404).json({ error: "Not found" }); return; }

  await db.update(attemptsTable).set({ status: "submitted", submittedAt: new Date() }).where(eq(attemptsTable.id, attemptId));

  const eqs = await db.select().from(examQuestionsTable).where(eq(examQuestionsTable.examId, attempt.examId));
  const savedAnswers = await db.select().from(attemptAnswersTable).where(eq(attemptAnswersTable.attemptId, attemptId));

  let score = 0;
  let totalPoints = 0;
  let hasPendingManual = false;

  for (const eq2 of eqs) {
    const [q] = await db.select().from(questionsTable).where(eq(questionsTable.id, eq2.questionId)).limit(1);
    if (!q) continue;
    totalPoints += q.points;
    const savedAnswer = savedAnswers.find(a => a.questionId === q.id);

    let pointsEarned = 0;
    let isCorrect: number | null = null;

    if (q.type === "essay" || q.type === "code") {
      hasPendingManual = true;
    } else if (savedAnswer?.answer && q.correctAnswer) {
      const correct = savedAnswer.answer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
      isCorrect = correct ? 1 : 0;
      pointsEarned = correct ? q.points : 0;
    }

    score += pointsEarned;

    await db.update(attemptAnswersTable).set({ pointsEarned, isCorrect })
      .where(and(eq(attemptAnswersTable.attemptId, attemptId), eq(attemptAnswersTable.questionId, q.id)));
  }

  const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
  const [exam] = await db.select().from(examsTable).where(eq(examsTable.id, attempt.examId)).limit(1);
  const isPassed = percentage >= (exam?.passingScore ?? 50) ? 1 : 0;
  const gradingStatus = hasPendingManual ? "pending_manual" : "auto_graded";

  const [result] = await db.insert(resultsTable).values({
    attemptId, studentId: attempt.studentId, examId: attempt.examId,
    score, totalPoints, percentage, isPassed, gradingStatus,
  }).returning();

  res.json({
    id: result.id,
    attemptId: result.attemptId,
    studentId: result.studentId,
    studentName: null,
    examId: result.examId,
    examTitle: exam?.title ?? null,
    score: result.score,
    totalPoints: result.totalPoints,
    percentage: result.percentage,
    isPassed: result.isPassed === 1,
    gradingStatus: result.gradingStatus,
    createdAt: result.createdAt.toISOString(),
  });
});

export default router;
