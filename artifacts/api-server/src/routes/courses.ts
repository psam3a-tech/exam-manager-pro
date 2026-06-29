import { Router } from "express";
import { db, coursesTable, departmentsTable, usersTable, enrollmentsTable, examsTable } from "@workspace/db";
import { eq, and, count } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import type { Request, Response } from "express";

const router = Router();

async function formatCourse(course: typeof coursesTable.$inferSelect) {
  let departmentName: string | null = null;
  let lecturerName: string | null = null;
  if (course.departmentId) {
    const [d] = await db.select({ name: departmentsTable.name }).from(departmentsTable).where(eq(departmentsTable.id, course.departmentId)).limit(1);
    departmentName = d?.name ?? null;
  }
  if (course.lecturerId) {
    const [l] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, course.lecturerId)).limit(1);
    lecturerName = l?.name ?? null;
  }
  const [enrollCount] = await db.select({ count: count() }).from(enrollmentsTable).where(eq(enrollmentsTable.courseId, course.id));
  const [examCount] = await db.select({ count: count() }).from(examsTable).where(eq(examsTable.courseId, course.id));
  return {
    id: course.id,
    name: course.name,
    code: course.code,
    description: course.description,
    departmentId: course.departmentId,
    departmentName,
    lecturerId: course.lecturerId,
    lecturerName,
    enrollmentCount: Number(enrollCount?.count ?? 0),
    examCount: Number(examCount?.count ?? 0),
    createdAt: course.createdAt.toISOString(),
  };
}

router.get("/courses", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { departmentId } = req.query;
  const conditions = [];
  if (departmentId) conditions.push(eq(coursesTable.departmentId, Number(departmentId)));
  const courses = await db.select().from(coursesTable).where(conditions.length > 0 ? and(...conditions) : undefined).orderBy(coursesTable.name);
  const results = await Promise.all(courses.map(formatCourse));
  res.json(results);
});

router.post("/courses", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { name, code, description, departmentId, lecturerId } = req.body;
  if (!name || !code) { res.status(400).json({ error: "name and code required" }); return; }
  const [course] = await db.insert(coursesTable).values({ name, code, description: description ?? null, departmentId: departmentId ?? null, lecturerId: lecturerId ?? null }).returning();
  res.status(201).json(await formatCourse(course));
});

router.get("/courses/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, id)).limit(1);
  if (!course) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await formatCourse(course));
});

router.patch("/courses/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const { name, code, description, departmentId, lecturerId } = req.body;
  const updates: Partial<typeof coursesTable.$inferInsert> = {};
  if (name !== undefined) updates.name = name;
  if (code !== undefined) updates.code = code;
  if (description !== undefined) updates.description = description;
  if (departmentId !== undefined) updates.departmentId = departmentId;
  if (lecturerId !== undefined) updates.lecturerId = lecturerId;
  const [course] = await db.update(coursesTable).set(updates).where(eq(coursesTable.id, id)).returning();
  if (!course) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await formatCourse(course));
});

router.delete("/courses/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  await db.delete(coursesTable).where(eq(coursesTable.id, id));
  res.status(204).send();
});

export default router;
