import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const violationTypeEnum = pgEnum("violation_type", [
  "tab_switch",
  "fullscreen_exit",
  "copy_paste",
  "focus_lost",
  "right_click",
  "keyboard_shortcut",
]);

export const proctoringViolationsTable = pgTable("proctoring_violations", {
  id: serial("id").primaryKey(),
  attemptId: integer("attempt_id").notNull(),
  type: violationTypeEnum("type").notNull(),
  description: text("description"),
  occurredAt: timestamp("occurred_at").notNull().defaultNow(),
});

export type ProctoringViolation = typeof proctoringViolationsTable.$inferSelect;
