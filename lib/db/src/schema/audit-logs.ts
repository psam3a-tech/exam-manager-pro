import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const auditLogsTable = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    action: text("action").notNull(), // "create", "update", "delete"
    resourceType: text("resource_type").notNull(), // "user", "exam", "course", etc.
    resourceId: text("resource_id").notNull(),
    changes: text("changes"), // JSON string of before/after changes
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ([
    index("audit_user_idx").on(t.userId),
    index("audit_timestamp_idx").on(t.timestamp),
    index("audit_resource_idx").on(t.resourceType, t.resourceId),
  ])
);

export const insertAuditLogSchema = createInsertSchema(auditLogsTable).omit({
  id: true,
  timestamp: true,
});
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogsTable.$inferSelect;
