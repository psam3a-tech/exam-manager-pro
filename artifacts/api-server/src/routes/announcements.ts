import { Router } from "express";
import { db, announcementsTable, usersTable, coursesTable, enrollmentsTable } from "@workspace/db";
import { eq, isNull, or, inArray } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import type { Request, Response } from "express";

const router = Router();

async function formatAnnouncement(a: typeof announcementsTable.$inferSelect) {
  const [author] = await db.select({ name: usersTable.name, role: usersTable.role }).from(usersTable).where(eq(usersTable.id, a.authorId)).limit(1);
  let courseName: string | null = null;
  if (a.courseId) {
    const [c] = await db.select({ name: coursesTable.name }).from(coursesTable).where(eq(coursesTable.id, a.courseId)).limit(1);
    courseName = c?.name ?? null;
  }
  return {
    id: a.id,
    courseId: a.courseId,
    courseName,
    authorId: a.authorId,
    authorName: author?.name ?? null,
    authorRole: author?.role ?? null,
    title: a.title,
    content: a.content,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

router.get("/announcements", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.query;
  const user = (req as any).user;
  let announcements: (typeof announcementsTable.$inferSelect)[];

  if (courseId) {
    announcements = await db.select().from(announcementsTable).where(eq(announcementsTable.courseId, Number(courseId))).orderBy(announcementsTable.createdAt);
  } else if (user.role === "student") {
    const enrollments = await db.select({ courseId: enrollmentsTable.courseId }).from(enrollmentsTable).where(eq(enrollmentsTable.studentId, user.userId));
    const courseIds = enrollments.map((e) => e.courseId);
    if (courseIds.length === 0) {
      announcements = await db.select().from(announcementsTable).where(isNull(announcementsTable.courseId)).orderBy(announcementsTable.createdAt);
    } else {
      announcements = await db.select().from(announcementsTable)
        .where(or(isNull(announcementsTable.courseId), inArray(announcementsTable.courseId, courseIds)))
        .orderBy(announcementsTable.createdAt);
    }
  } else {
    announcements = await db.select().from(announcementsTable).orderBy(announcementsTable.createdAt);
  }

  const results = await Promise.all(announcements.map(formatAnnouncement));
  res.json(results.reverse());
});

router.post("/announcements", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { courseId, title, content } = req.body;
  if (!title || !content) { res.status(400).json({ error: "title and content required" }); return; }
  const [ann] = await db.insert(announcementsTable).values({
    courseId: courseId ? Number(courseId) : null,
    authorId: user.userId,
    title,
    content,
    updatedAt: new Date(),
  }).returning();
  res.status(201).json(await formatAnnouncement(ann));
});

router.put("/announcements/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const { title, content } = req.body;
  const [updated] = await db.update(announcementsTable)
    .set({ title, content, updatedAt: new Date() })
    .where(eq(announcementsTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await formatAnnouncement(updated));
});

router.delete("/announcements/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  await db.delete(announcementsTable).where(eq(announcementsTable.id, id));
  res.status(204).end();
});

export default router;
