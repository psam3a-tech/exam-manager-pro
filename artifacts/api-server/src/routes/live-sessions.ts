import { Router } from "express";
import { db, liveSessionsTable, coursesTable, usersTable, enrollmentsTable } from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import type { Request, Response } from "express";

const router = Router();

async function formatSession(s: typeof liveSessionsTable.$inferSelect) {
  const [course] = await db.select({ name: coursesTable.name }).from(coursesTable).where(eq(coursesTable.id, s.courseId)).limit(1);
  const [lecturer] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, s.lecturerId)).limit(1);
  return {
    id: s.id,
    courseId: s.courseId,
    courseName: course?.name ?? null,
    lecturerId: s.lecturerId,
    lecturerName: lecturer?.name ?? null,
    title: s.title,
    description: s.description,
    scheduledAt: s.scheduledAt.toISOString(),
    durationMinutes: s.durationMinutes,
    meetingUrl: s.meetingUrl,
    recordingUrl: s.recordingUrl,
    status: s.status,
    createdAt: s.createdAt.toISOString(),
  };
}

router.get("/live-sessions", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.query;
  const user = (req as any).user;
  let sessions: (typeof liveSessionsTable.$inferSelect)[];

  if (courseId) {
    sessions = await db.select().from(liveSessionsTable).where(eq(liveSessionsTable.courseId, Number(courseId))).orderBy(liveSessionsTable.scheduledAt);
  } else if (user.role === "student") {
    const enrollments = await db.select({ courseId: enrollmentsTable.courseId }).from(enrollmentsTable).where(eq(enrollmentsTable.studentId, user.userId));
    const courseIds = enrollments.map((e) => e.courseId);
    if (courseIds.length === 0) { res.json([]); return; }
    sessions = await db.select().from(liveSessionsTable).where(inArray(liveSessionsTable.courseId, courseIds)).orderBy(liveSessionsTable.scheduledAt);
  } else if (user.role === "lecturer") {
    sessions = await db.select().from(liveSessionsTable).where(eq(liveSessionsTable.lecturerId, user.userId)).orderBy(liveSessionsTable.scheduledAt);
  } else {
    sessions = await db.select().from(liveSessionsTable).orderBy(liveSessionsTable.scheduledAt);
  }

  const results = await Promise.all(sessions.map(formatSession));
  res.json(results);
});

router.post("/live-sessions", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { courseId, title, description, scheduledAt, durationMinutes, meetingUrl, status } = req.body;
  if (!courseId || !title || !scheduledAt) { res.status(400).json({ error: "courseId, title, scheduledAt required" }); return; }
  const [session] = await db.insert(liveSessionsTable).values({
    courseId: Number(courseId),
    lecturerId: user.userId,
    title,
    description: description ?? null,
    scheduledAt: new Date(scheduledAt),
    durationMinutes: durationMinutes ?? 60,
    meetingUrl: meetingUrl ?? null,
    recordingUrl: null,
    status: status ?? "scheduled",
  }).returning();
  res.status(201).json(await formatSession(session));
});

router.put("/live-sessions/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const { title, description, scheduledAt, durationMinutes, meetingUrl, recordingUrl, status } = req.body;
  const updates: Partial<typeof liveSessionsTable.$inferInsert> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (scheduledAt !== undefined) updates.scheduledAt = new Date(scheduledAt);
  if (durationMinutes !== undefined) updates.durationMinutes = durationMinutes;
  if (meetingUrl !== undefined) updates.meetingUrl = meetingUrl;
  if (recordingUrl !== undefined) updates.recordingUrl = recordingUrl;
  if (status !== undefined) updates.status = status;
  const [updated] = await db.update(liveSessionsTable).set(updates).where(eq(liveSessionsTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await formatSession(updated));
});

router.delete("/live-sessions/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  await db.delete(liveSessionsTable).where(eq(liveSessionsTable.id, id));
  res.status(204).end();
});

export default router;
