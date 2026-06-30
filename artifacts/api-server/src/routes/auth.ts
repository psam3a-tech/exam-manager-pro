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

router.post("/auth/register", async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, studentId } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: "Name, email and password are required" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const [existing] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing) {
    res.status(409).json({ error: "An account with that email already exists" });
    return;
  }

  const [newUser] = await db.insert(usersTable).values({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash: hashPassword(password),
    role: "student",
    studentId: studentId?.trim() || null,
    isActive: true,
  }).returning();

  const token = signToken({ userId: newUser.id, role: newUser.role, email: newUser.email });
  res.status(201).json({
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      departmentId: newUser.departmentId,
      departmentName: null,
      studentId: newUser.studentId,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt.toISOString(),
    },
    token,
  });
});

router.post("/auth/forgot-password", async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  const [user] = await db.select({ id: usersTable.id, email: usersTable.email })
    .from(usersTable).where(eq(usersTable.email, email.toLowerCase().trim())).limit(1);

  if (!user) {
    res.status(404).json({ error: "No account found with that email address" });
    return;
  }

  const { randomInt } = await import("crypto");
  const code = String(randomInt(100000, 999999));
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await db.update(usersTable)
    .set({ resetToken: code, resetTokenExpiresAt: expiresAt })
    .where(eq(usersTable.id, user.id));

  res.json({ resetCode: code });
});

router.post("/auth/reset-password", async (req: Request, res: Response): Promise<void> => {
  const { code, password } = req.body;
  if (!code || !password) {
    res.status(400).json({ error: "Code and new password are required" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const now = new Date();
  const [user] = await db.select({ id: usersTable.id, resetTokenExpiresAt: usersTable.resetTokenExpiresAt })
    .from(usersTable).where(eq(usersTable.resetToken, code)).limit(1);

  if (!user) {
    res.status(400).json({ error: "Invalid reset code" });
    return;
  }
  if (!user.resetTokenExpiresAt || user.resetTokenExpiresAt < now) {
    res.status(400).json({ error: "Reset code has expired. Please request a new one." });
    return;
  }

  await db.update(usersTable)
    .set({ passwordHash: hashPassword(password), resetToken: null, resetTokenExpiresAt: null })
    .where(eq(usersTable.id, user.id));

  res.json({ success: true });
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
