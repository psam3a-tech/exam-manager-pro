import { Router } from "express";
import { db, examsTable, examQuestionsTable, questionsTable, coursesTable, classesTable, attemptsTable } from "@workspace/db";
import { eq, and, count } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import type { Request, Response } from "express";

const router = Router();

async function formatExam(exam: typeof examsTable.$inferSelect) {
  let courseName: string | null = null;
  let className: string | null = null;
  if (exam.courseId) {
    const [c] = await db.select({ name: coursesTable.name }).from(coursesTable).where(eq(coursesTable.id, exam.courseId)).limit(1);
    courseName = c?.name ?? null;
  }
  if (exam.classId) {
    const [cl] = await db.select({ name: classesTable.name }).from(classesTable).where(eq(classesTable.id, exam.classId)).limit(1);
    className = cl?.name ?? null;
  }
  const eqs = await db.select().from(examQuestionsTable).where(eq(examQuestionsTable.examId, exam.id));
  const totalPoints = eqs.length > 0
    ? (await Promise.all(eqs.map(async (eq2) => {
        const [q] = await db.select({ points: questionsTable.points }).from(questionsTable).where(eq(questionsTable.id, eq2.questionId)).limit(1);
        return q?.points ?? 0;
      }))).reduce((a, b) => a + b, 0)
    : 0;
  const [attemptCount] = await db.select({ count: count() }).from(attemptsTable).where(eq(attemptsTable.examId, exam.id));
  return {
    id: exam.id,
    title: exam.title,
    description: exam.description,
    courseId: exam.courseId,
    courseName,
    classId: exam.classId,
    className,
    status: exam.status,
    durationMinutes: exam.durationMinutes,
    totalPoints,
    passingScore: exam.passingScore,
    startTime: exam.startTime?.toISOString() ?? null,
    endTime: exam.endTime?.toISOString() ?? null,
    shuffleQuestions: exam.shuffleQuestions,
    showResults: exam.showResults,
    questionCount: eqs.length,
    attemptCount: Number(attemptCount?.count ?? 0),
    createdAt: exam.createdAt.toISOString(),
  };
}

router.get("/exams", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { courseId, status } = req.query;
  const conditions = [];
  if (courseId) conditions.push(eq(examsTable.courseId, Number(courseId)));
  if (status) conditions.push(eq(examsTable.status, status as typeof examsTable.$inferSelect["status"]));
  const exams = await db.select().from(examsTable).where(conditions.length > 0 ? and(...conditions) : undefined).orderBy(examsTable.createdAt);
  const results = await Promise.all(exams.map(formatExam));
  res.json(results);
});

router.post("/exams", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { title, description, courseId, classId, durationMinutes, passingScore, startTime, endTime, shuffleQuestions, showResults } = req.body;
  if (!title || !courseId || !durationMinutes) { res.status(400).json({ error: "title, courseId, durationMinutes required" }); return; }
  const [exam] = await db.insert(examsTable).values({
    title, description: description ?? null, courseId, classId: classId ?? null,
    durationMinutes, passingScore: passingScore ?? 50,
    startTime: startTime ? new Date(startTime) : null,
    endTime: endTime ? new Date(endTime) : null,
    shuffleQuestions: shuffleQuestions ?? false,
    showResults: showResults ?? true,
  }).returning();
  res.status(201).json(await formatExam(exam));
});

router.get("/exams/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const [exam] = await db.select().from(examsTable).where(eq(examsTable.id, id)).limit(1);
  if (!exam) { res.status(404).json({ error: "Not found" }); return; }

  const eqs = await db.select().from(examQuestionsTable).where(eq(examQuestionsTable.examId, id)).orderBy(examQuestionsTable.orderIndex);
  const questions = await Promise.all(eqs.map(async (eq2) => {
    const [q] = await db.select().from(questionsTable).where(eq(questionsTable.id, eq2.questionId)).limit(1);
    if (!q) return null;
    return {
      id: q.id, text: q.text, type: q.type, courseId: q.courseId,
      courseName: null, points: q.points, difficulty: q.difficulty,
      options: q.options, correctAnswer: q.correctAnswer,
      explanation: q.explanation, codeLanguage: q.codeLanguage,
      createdAt: q.createdAt.toISOString(),
    };
  }));

  const base = await formatExam(exam);
  res.json({ ...base, questions: questions.filter(Boolean) });
});

router.patch("/exams/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const { title, description, durationMinutes, passingScore, startTime, endTime, shuffleQuestions, showResults, status } = req.body;
  const updates: Partial<typeof examsTable.$inferInsert> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (durationMinutes !== undefined) updates.durationMinutes = durationMinutes;
  if (passingScore !== undefined) updates.passingScore = passingScore;
  if (startTime !== undefined) updates.startTime = startTime ? new Date(startTime) : null;
  if (endTime !== undefined) updates.endTime = endTime ? new Date(endTime) : null;
  if (shuffleQuestions !== undefined) updates.shuffleQuestions = shuffleQuestions;
  if (showResults !== undefined) updates.showResults = showResults;
  if (status !== undefined) updates.status = status;
  const [exam] = await db.update(examsTable).set(updates).where(eq(examsTable.id, id)).returning();
  if (!exam) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await formatExam(exam));
});

router.delete("/exams/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  await db.delete(examQuestionsTable).where(eq(examQuestionsTable.examId, id));
  await db.delete(examsTable).where(eq(examsTable.id, id));
  res.status(204).send();
});

router.post("/exams/:id/questions", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const examId = Number(req.params.id);
  const { questionId, orderIndex } = req.body;
  if (!questionId) { res.status(400).json({ error: "questionId required" }); return; }
  const existing = await db.select().from(examQuestionsTable)
    .where(and(eq(examQuestionsTable.examId, examId), eq(examQuestionsTable.questionId, questionId)));
  if (existing.length > 0) { res.status(400).json({ error: "Question already in exam" }); return; }
  await db.insert(examQuestionsTable).values({ examId, questionId, orderIndex: orderIndex ?? 0 });
  res.status(201).json({ success: true });
});

router.delete("/exams/:id/questions/:questionId", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const examId = Number(req.params.id);
  const questionId = Number(req.params.questionId);
  await db.delete(examQuestionsTable).where(and(eq(examQuestionsTable.examId, examId), eq(examQuestionsTable.questionId, questionId)));
  res.status(204).send();
});

router.post("/exams/:id/publish", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const [exam] = await db.update(examsTable).set({ status: "published" }).where(eq(examsTable.id, id)).returning();
  if (!exam) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await formatExam(exam));
});

export default router;
