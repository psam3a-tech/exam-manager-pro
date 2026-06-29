import { Router } from "express";
import { db, enrollmentsTable, usersTable, coursesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import type { Request, Response } from "express";

const router = Router();

async function formatEnrollment(e: typeof enrollmentsTable.$inferSelect) {
  let studentName: string | null = null;
  let courseName: string | null = null;
  const [s] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, e.studentId)).limit(1);
  studentName = s?.name ?? null;
  const [c] = await db.select({ name: coursesTable.name }).from(coursesTable).where(eq(coursesTable.id, e.courseId)).limit(1);
  courseName = c?.name ?? null;
  return {
    id: e.id,
    studentId: e.studentId,
    studentName,
    courseId: e.courseId,
    courseName,
    classId: e.classId,
    enrolledAt: e.enrolledAt.toISOString(),
  };
}

router.get("/enrollments", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { studentId, courseId } = req.query;
  const conditions = [];
  if (studentId) conditions.push(eq(enrollmentsTable.studentId, Number(studentId)));
  if (courseId) conditions.push(eq(enrollmentsTable.courseId, Number(courseId)));
  const rows = await db.select().from(enrollmentsTable).where(conditions.length > 0 ? and(...conditions) : undefined);
  const results = await Promise.all(rows.map(formatEnrollment));
  res.json(results);
});

router.post("/enrollments", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { studentId, courseId, classId } = req.body;
  if (!studentId || !courseId) { res.status(400).json({ error: "studentId and courseId required" }); return; }
  const existing = await db.select().from(enrollmentsTable)
    .where(and(eq(enrollmentsTable.studentId, studentId), eq(enrollmentsTable.courseId, courseId)));
  if (existing.length > 0) { res.status(400).json({ error: "Already enrolled" }); return; }
  const [row] = await db.insert(enrollmentsTable).values({ studentId, courseId, classId: classId ?? null }).returning();
  res.status(201).json(await formatEnrollment(row));
});

router.delete("/enrollments/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  await db.delete(enrollmentsTable).where(eq(enrollmentsTable.id, id));
  res.status(204).send();
});

export default router;
