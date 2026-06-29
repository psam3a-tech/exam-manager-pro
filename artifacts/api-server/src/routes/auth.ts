import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";
import { signToken, requireAuth, type AuthPayload } from "../middlewares/auth";
import type { Request, Response } from "express";

const router = Router();

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "oems_salt").digest("hex");
}

router.post("/auth/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  if (!user.isActive) {
    res.status(401).json({ error: "Account is inactive" });
    return;
  }

  let departmentName: string | null = null;
  if (user.departmentId) {
    const { departmentsTable } = await import("@workspace/db");
    const [dept] = await db.select({ name: departmentsTable.name }).from(departmentsTable).where(eq(departmentsTable.id, user.departmentId)).limit(1);
    departmentName = dept?.name ?? null;
  }

  const token = signToken({ userId: user.id, role: user.role, email: user.email });
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
      departmentName,
      studentId: user.studentId,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    },
    token,
  });
});

router.post("/auth/logout", (_req: Request, res: Response): void => {
  res.json({ success: true });
});

router.get("/auth/me", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const authUser = (req as Request & { user: AuthPayload }).user;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, authUser.userId)).limit(1);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  let departmentName: string | null = null;
  if (user.departmentId) {
    const { departmentsTable } = await import("@workspace/db");
    const [dept] = await db.select({ name: departmentsTable.name }).from(departmentsTable).where(eq(departmentsTable.id, user.departmentId)).limit(1);
    departmentName = dept?.name ?? null;
  }
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId,
    departmentName,
    studentId: user.studentId,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
  });
});

export function hashPasswordExport(password: string): string {
  return hashPassword(password);
}

export default router;
