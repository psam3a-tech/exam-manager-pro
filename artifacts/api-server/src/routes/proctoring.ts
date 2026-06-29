import { Router } from "express";
import { db, proctoringViolationsTable, attemptsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import type { Request, Response } from "express";

const router = Router();

router.post("/attempts/:id/violations", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const attemptId = Number(req.params.id);
  const { type, description } = req.body;
  if (!type) { res.status(400).json({ error: "type is required" }); return; }
  const [violation] = await db.insert(proctoringViolationsTable).values({
    attemptId,
    type,
    description: description ?? null,
  }).returning();
  res.status(201).json(violation);
});

router.get("/attempts/:id/violations", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const attemptId = Number(req.params.id);
  const violations = await db.select().from(proctoringViolationsTable)
    .where(eq(proctoringViolationsTable.attemptId, attemptId))
    .orderBy(proctoringViolationsTable.occurredAt);
  res.json(violations);
});

router.get("/exams/:id/proctoring-report", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const examId = Number(req.params.id);
  const attempts = await db.select().from(attemptsTable).where(eq(attemptsTable.examId, examId));
  const report = await Promise.all(attempts.map(async (attempt) => {
    const violations = await db.select().from(proctoringViolationsTable)
      .where(eq(proctoringViolationsTable.attemptId, attempt.id))
      .orderBy(proctoringViolationsTable.occurredAt);
    return { attempt, violations, violationCount: violations.length };
  }));
  report.sort((a, b) => b.violationCount - a.violationCount);
  res.json(report);
});

export default router;
