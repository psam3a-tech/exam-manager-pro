import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authenticate";

type UserRole = "super_admin" | "admin" | "lecturer" | "student";

/**
 * Middleware factory to authorize requests based on user role
 * Usage: authorize("super_admin", "admin")(req, res, next)
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized: user not authenticated" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: "Forbidden: insufficient permissions",
        details: `Required roles: ${allowedRoles.join(", ")}, got: ${req.user.role}`,
      });
      return;
    }

    next();
  };
}
