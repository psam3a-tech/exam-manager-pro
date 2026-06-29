import { Router } from "express";
import { db, usersTable, departmentsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { createHash } from "crypto";
import { requireAuth } from "../middlewares/auth";
import type { Request, Response } from "express";

const router = Router();

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "oems_salt").digest("hex");
}

function formatUser(user: typeof usersTable.$inferSelect, deptName?: string | null) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId,
    departmentName: deptName ?? null,
    studentId: user.studentId,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
  };
}

router.get("/users", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { role, departmentId } = req.query;
  const conditions = [];
  if (role) conditions.push(eq(usersTable.role, role as string as typeof usersTable.$inferSelect["role"]));
  if (departmentId) conditions.push(eq(usersTable.departmentId, Number(departmentId)));

  const users = await db.select({
    user: usersTable,
    deptName: departmentsTable.name,
  })
    .from(usersTable)
    .leftJoin(departmentsTable, eq(usersTable.departmentId, departmentsTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  res.json(users.map(({ user, deptName }) => formatUser(user, deptName)));
});

router.post("/users", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role, departmentId, studentId } = req.body;
  if (!name || !email || !password || !role) {
    res.status(400).json({ error: "name, email, password, role required" });
    return;
  }
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing) {
    res.status(400).json({ error: "Email already in use" });
    return;
  }
  const [user] = await db.insert(usersTable).values({
    name,
    email,
    passwordHash: hashPassword(password),
    role,
    departmentId: departmentId ?? null,
    studentId: studentId ?? null,
    isActive: true,
  }).returning();

  let deptName: string | null = null;
  if (user.departmentId) {
    const [d] = await db.select({ name: departmentsTable.name }).from(departmentsTable).where(eq(departmentsTable.id, user.departmentId)).limit(1);
    deptName = d?.name ?? null;
  }
  res.status(201).json(formatUser(user, deptName));
});

router.get("/users/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const [row] = await db.select({ user: usersTable, deptName: departmentsTable.name })
    .from(usersTable)
    .leftJoin(departmentsTable, eq(usersTable.departmentId, departmentsTable.id))
    .where(eq(usersTable.id, id))
    .limit(1);
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatUser(row.user, row.deptName));
});

router.patch("/users/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const { name, email, role, departmentId, isActive, studentId } = req.body;
  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = email;
  if (role !== undefined) updates.role = role;
  if (departmentId !== undefined) updates.departmentId = departmentId;
  if (isActive !== undefined) updates.isActive = isActive;
  if (studentId !== undefined) updates.studentId = studentId;

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!user) { res.status(404).json({ error: "Not found" }); return; }

  let deptName: string | null = null;
  if (user.departmentId) {
    const [d] = await db.select({ name: departmentsTable.name }).from(departmentsTable).where(eq(departmentsTable.id, user.departmentId)).limit(1);
    deptName = d?.name ?? null;
  }
  res.json(formatUser(user, deptName));
});

router.delete("/users/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.status(204).send();
});

export default router;
