import { Router } from "express";
import { db, assignmentsTable, assignmentSubmissionsTable, coursesTable, usersTable, enrollmentsTable } from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import type { Request, Response } from "express";

const router = Router();

async function formatAssignment(a: typeof assignmentsTable.$inferSelect) {
  const [course] = await db.select({ name: coursesTable.name }).from(coursesTable).where(eq(coursesTable.id, a.courseId)).limit(1);
  const [lecturer] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, a.lecturerId)).limit(1);
  return {
    id: a.id,
    courseId: a.courseId,
    courseName: course?.name ?? null,
    lecturerId: a.lecturerId,
    lecturerName: lecturer?.name ?? null,
    title: a.title,
    description: a.description,
    dueDate: a.dueDate?.toISOString() ?? null,
    totalPoints: a.totalPoints,
    status: a.status,
    createdAt: a.createdAt.toISOString(),
  };
}

router.get("/assignments", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.query;
  const user = (req as any).user;
  let assignments: (typeof assignmentsTable.$inferSelect)[];

  if (courseId) {
    assignments = await db.select().from(assignmentsTable).where(eq(assignmentsTable.courseId, Number(courseId))).orderBy(assignmentsTable.createdAt);
  } else if (user.role === "student") {
    const enrollments = await db.select({ courseId: enrollmentsTable.courseId }).from(enrollmentsTable).where(eq(enrollmentsTable.studentId, user.userId));
    const courseIds = enrollments.map((e) => e.courseId);
    if (courseIds.length === 0) { res.json([]); return; }
    assignments = await db.select().from(assignmentsTable).where(inArray(assignmentsTable.courseId, courseIds)).orderBy(assignmentsTable.createdAt);
  } else if (user.role === "lecturer") {
    assignments = await db.select().from(assignmentsTable).where(eq(assignmentsTable.lecturerId, user.userId)).orderBy(assignmentsTable.createdAt);
  } else {
    assignments = await db.select().from(assignmentsTable).orderBy(assignmentsTable.createdAt);
  }

  const results = await Promise.all(assignments.map(formatAssignment));
  res.json(results);
});

router.post("/assignments", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { courseId, title, description, dueDate, totalPoints, status } = req.body;
  if (!courseId || !title) { res.status(400).json({ error: "courseId and title required" }); return; }
  const [assignment] = await db.insert(assignmentsTable).values({
    courseId: Number(courseId),
    lecturerId: user.userId,
    title,
    description: description ?? null,
    dueDate: dueDate ? new Date(dueDate) : null,
    totalPoints: totalPoints ?? 100,
    status: status ?? "draft",
  }).returning();
  res.status(201).json(await formatAssignment(assignment));
});

router.put("/assignments/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const { title, description, dueDate, totalPoints, status } = req.body;
  const updates: Partial<typeof assignmentsTable.$inferInsert> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (dueDate !== undefined) updates.dueDate = dueDate ? new Date(dueDate) : null;
  if (totalPoints !== undefined) updates.totalPoints = totalPoints;
  if (status !== undefined) updates.status = status;
  const [updated] = await db.update(assignmentsTable).set(updates).where(eq(assignmentsTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await formatAssignment(updated));
});

router.delete("/assignments/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  await db.delete(assignmentSubmissionsTable).where(eq(assignmentSubmissionsTable.assignmentId, id));
  await db.delete(assignmentsTable).where(eq(assignmentsTable.id, id));
  res.status(204).end();
});

router.get("/assignments/:id/submissions", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const assignmentId = Number(req.params.id);
  const subs = await db.select().from(assignmentSubmissionsTable).where(eq(assignmentSubmissionsTable.assignmentId, assignmentId));
  const results = await Promise.all(subs.map(async (s) => {
    const [student] = await db.select({ name: usersTable.name, email: usersTable.email }).from(usersTable).where(eq(usersTable.id, s.studentId)).limit(1);
    return { ...s, studentName: student?.name ?? null, studentEmail: student?.email ?? null, submittedAt: s.submittedAt.toISOString() };
  }));
  res.json(results);
});

router.post("/assignments/:id/submit", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const assignmentId = Number(req.params.id);
  const user = (req as any).user;
  const { content } = req.body;
  const existing = await db.select().from(assignmentSubmissionsTable)
    .where(and(eq(assignmentSubmissionsTable.assignmentId, assignmentId), eq(assignmentSubmissionsTable.studentId, user.userId)))
    .limit(1);
  if (existing.length > 0) {
    const [updated] = await db.update(assignmentSubmissionsTable)
      .set({ content: content ?? null, submittedAt: new Date(), status: "submitted" })
      .where(eq(assignmentSubmissionsTable.id, existing[0].id)).returning();
    res.json(updated);
  } else {
    const [sub] = await db.insert(assignmentSubmissionsTable).values({
      assignmentId,
      studentId: user.userId,
      content: content ?? null,
      status: "submitted",
    }).returning();
    res.status(201).json(sub);
  }
});

router.put("/submissions/:id/grade", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const { grade, feedback } = req.body;
  const [updated] = await db.update(assignmentSubmissionsTable)
    .set({ grade: grade ?? null, feedback: feedback ?? null, status: "graded" })
    .where(eq(assignmentSubmissionsTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

router.get("/assignments/:id/my-submission", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const assignmentId = Number(req.params.id);
  const user = (req as any).user;
  const [sub] = await db.select().from(assignmentSubmissionsTable)
    .where(and(eq(assignmentSubmissionsTable.assignmentId, assignmentId), eq(assignmentSubmissionsTable.studentId, user.userId)))
    .limit(1);
  res.json(sub ?? null);
});

export default router;
