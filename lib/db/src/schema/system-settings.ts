import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const systemSettingsTable = pgTable("system_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  schoolName: text("school_name").notNull(),
  schoolLogo: text("school_logo"), // Base64 or URL
  gradingScale: text("grading_scale").notNull(), // JSON: { A: { min: 80, max: 100 }, ... }
  academicYear: text("academic_year").notNull(),
  terms: text("terms").notNull(), // JSON array: ["Term 1", "Term 2", "Term 3"]
  timezone: text("timezone").notNull().default("UTC"),
  sessionTimeoutMinutes: text("session_timeout_minutes").notNull().default("30"), // minutes
  minPasswordLength: text("min_password_length").notNull().default("8"),
  requirePasswordComplexity: text("require_password_complexity").notNull().default("true"), // boolean as string
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSystemSettingsSchema = createInsertSchema(systemSettingsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSystemSettings = z.infer<typeof insertSystemSettingsSchema>;
export type SystemSettings = typeof systemSettingsTable.$inferSelect;
