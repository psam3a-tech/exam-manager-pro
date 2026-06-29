import { Router } from "express";
import { db, classesTable, coursesTable, enrollmentsTable } from "@workspace/db";
import { eq, and, count } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import type { Request, Response } from "express";

const router = Router();

async function formatClass(cls: typeof classesTable.$inferSelect) {
  let courseName: string | null = null;
  const [c] = await db.select({ name: coursesTable.name }).from(coursesTable).where(eq(coursesTable.id, cls.courseId)).limit(1);
  courseName = c?.name ?? null;
  const [studentCount] = await db.select({ count: count() }).from(enrollmentsTable).where(eq(enrollmentsTable.classId, cls.id));
  return {
    id: cls.id,
    name: cls.name,
    courseId: cls.courseId,
    courseName,
    academicYear: cls.academicYear,
    semester: cls.semester,
    studentCount: Number(studentCount?.count ?? 0),
    createdAt: cls.createdAt.toISOString(),
  };
}

router.get("/classes", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.query;
  const conditions = [];
  if (courseId) conditions.push(eq(classesTable.courseId, Number(courseId)));
  const classes = await db.select().from(classesTable).where(conditions.length > 0 ? and(...conditions) : undefined).orderBy(classesTable.name);
  const results = await Promise.all(classes.map(formatClass));
  res.json(results);
});

router.post("/classes", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { name, courseId, academicYear, semester } = req.body;
  if (!name || !courseId) { res.status(400).json({ error: "name and courseId required" }); return; }
  const [cls] = await db.insert(classesTable).values({ name, courseId, academicYear: academicYear ?? null, semester: semester ?? null }).returning();
  res.status(201).json(await formatClass(cls));
});

router.patch("/classes/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const { name, academicYear, semester } = req.body;
  const updates: Partial<typeof classesTable.$inferInsert> = {};
  if (name !== undefined) updates.name = name;
  if (academicYear !== undefined) updates.academicYear = academicYear;
  if (semester !== undefined) updates.semester = semester;
  const [cls] = await db.update(classesTable).set(updates).where(eq(classesTable.id, id)).returning();
  if (!cls) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await formatClass(cls));
});

router.delete("/classes/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  await db.delete(classesTable).where(eq(classesTable.id, id));
  res.status(204).send();
});

export default router;
