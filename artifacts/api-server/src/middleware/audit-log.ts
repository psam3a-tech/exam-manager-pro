import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authenticate";
import { db } from "@workspace/db";
import { auditLogsTable } from "@workspace/db/schema";

export interface AuditLogData {
  action: "create" | "update" | "delete" | "read";
  resourceType: string;
  resourceId: string;
  changes?: Record<string, any>; // before/after changes
}

/**
 * Log audit events to the database
 */
export async function logAuditEvent(
  userId: number,
  data: AuditLogData,
  req: AuthenticatedRequest
): Promise<void> {
  try {
    await db.insert(auditLogsTable).values({
      userId: String(userId),
      action: data.action,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      changes: data.changes ? JSON.stringify(data.changes) : null,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });
  } catch (error) {
    console.error("Failed to log audit event:", error);
    // Don't throw - logging failures shouldn't break the request
  }
}

/**
 * Middleware to attach audit logging helper to request
 */
export function auditLogging(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  req.logAudit = async (data: AuditLogData) => {
    if (!req.user) return;
    await logAuditEvent(req.user.id, data, req);
  };
  next();
}

// Extend Express Request to include logAudit method
declare global {
  namespace Express {
    interface Request {
      logAudit?: (data: AuditLogData) => Promise<void>;
    }
  }
}
