import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const materialTypeEnum = pgEnum("material_type", [
  "video",
  "pdf",
  "link",
  "slide",
  "document",
  "audio",
]);

export const courseMaterialsTable = pgTable("course_materials", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  uploadedById: integer("uploaded_by_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  type: materialTypeEnum("type").notNull(),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCourseMaterialSchema = createInsertSchema(courseMaterialsTable).omit({ id: true, createdAt: true });
export type InsertCourseMaterial = z.infer<typeof insertCourseMaterialSchema>;
export type CourseMaterial = typeof courseMaterialsTable.$inferSelect;
