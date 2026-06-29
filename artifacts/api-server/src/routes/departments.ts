import { Router } from "express";
import { db, departmentsTable, usersTable, coursesTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import type { Request, Response } from "express";

const router = Router();

async function formatDepartment(dept: typeof departmentsTable.$inferSelect) {
  const [userCount] = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.departmentId, dept.id));
  const [courseCount] = await db.select({ count: count() }).from(coursesTable).where(eq(coursesTable.departmentId, dept.id));
  return {
    id: dept.id,
    name: dept.name,
    code: dept.code,
    description: dept.description,
    userCount: Number(userCount?.count ?? 0),
    courseCount: Number(courseCount?.count ?? 0),
    createdAt: dept.createdAt.toISOString(),
  };
}

router.get("/departments", requireAuth, async (_req: Request, res: Response): Promise<void> => {
  const depts = await db.select().from(departmentsTable).orderBy(departmentsTable.name);
  const results = await Promise.all(depts.map(formatDepartment));
  res.json(results);
});

router.post("/departments", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { name, code, description } = req.body;
  if (!name) { res.status(400).json({ error: "name required" }); return; }
  const [dept] = await db.insert(departmentsTable).values({ name, code: code ?? null, description: description ?? null }).returning();
  res.status(201).json(await formatDepartment(dept));
});

router.patch("/departments/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const { name, code, description } = req.body;
  const updates: Partial<typeof departmentsTable.$inferInsert> = {};
  if (name !== undefined) updates.name = name;
  if (code !== undefined) updates.code = code;
  if (description !== undefined) updates.description = description;
  const [dept] = await db.update(departmentsTable).set(updates).where(eq(departmentsTable.id, id)).returning();
  if (!dept) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await formatDepartment(dept));
});

router.delete("/departments/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  await db.delete(departmentsTable).where(eq(departmentsTable.id, id));
  res.status(204).send();
});

export default router;
