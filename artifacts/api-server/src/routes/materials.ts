import { Router } from "express";
import { db, courseMaterialsTable, coursesTable, usersTable, enrollmentsTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import type { Request, Response } from "express";

const router = Router();

async function formatMaterial(m: typeof courseMaterialsTable.$inferSelect) {
  const [course] = await db.select({ name: coursesTable.name }).from(coursesTable).where(eq(coursesTable.id, m.courseId)).limit(1);
  const [uploader] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, m.uploadedById)).limit(1);
  return {
    id: m.id,
    courseId: m.courseId,
    courseName: course?.name ?? null,
    uploadedById: m.uploadedById,
    uploaderName: uploader?.name ?? null,
    title: m.title,
    description: m.description,
    type: m.type,
    url: m.url,
    sortOrder: m.sortOrder,
    createdAt: m.createdAt.toISOString(),
  };
}

router.get("/materials", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.query;
  const user = (req as any).user;
  let materials: (typeof courseMaterialsTable.$inferSelect)[];

  if (courseId) {
    materials = await db.select().from(courseMaterialsTable).where(eq(courseMaterialsTable.courseId, Number(courseId))).orderBy(courseMaterialsTable.sortOrder);
  } else if (user.role === "student") {
    const enrollments = await db.select({ courseId: enrollmentsTable.courseId }).from(enrollmentsTable).where(eq(enrollmentsTable.studentId, user.userId));
    const courseIds = enrollments.map((e) => e.courseId);
    if (courseIds.length === 0) { res.json([]); return; }
    materials = await db.select().from(courseMaterialsTable).where(inArray(courseMaterialsTable.courseId, courseIds)).orderBy(courseMaterialsTable.sortOrder);
  } else if (user.role === "lecturer") {
    materials = await db.select().from(courseMaterialsTable).where(eq(courseMaterialsTable.uploadedById, user.userId)).orderBy(courseMaterialsTable.sortOrder);
  } else {
    materials = await db.select().from(courseMaterialsTable).orderBy(courseMaterialsTable.sortOrder);
  }

  const results = await Promise.all(materials.map(formatMaterial));
  res.json(results);
});

router.post("/materials", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { courseId, title, description, type, url, sortOrder } = req.body;
  if (!courseId || !title || !type || !url) { res.status(400).json({ error: "courseId, title, type, url required" }); return; }
  const [material] = await db.insert(courseMaterialsTable).values({
    courseId: Number(courseId),
    uploadedById: user.userId,
    title,
    description: description ?? null,
    type,
    url,
    sortOrder: sortOrder ?? 0,
  }).returning();
  res.status(201).json(await formatMaterial(material));
});

router.put("/materials/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const { title, description, type, url, sortOrder } = req.body;
  const updates: Partial<typeof courseMaterialsTable.$inferInsert> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (type !== undefined) updates.type = type;
  if (url !== undefined) updates.url = url;
  if (sortOrder !== undefined) updates.sortOrder = sortOrder;
  const [updated] = await db.update(courseMaterialsTable).set(updates).where(eq(courseMaterialsTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await formatMaterial(updated));
});

router.delete("/materials/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  await db.delete(courseMaterialsTable).where(eq(courseMaterialsTable.id, id));
  res.status(204).end();
});

export default router;
