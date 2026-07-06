import { Router, Response } from "express";
import { z } from "zod/v4";
import { AuthenticatedRequest, authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { auditLogging, logAuditEvent } from "../middleware/audit-log";
import { filterQuestionBankSchema } from "@workspace/api-zod";
import {
  createQuestionBankItem,
  getQuestionBankItem,
  updateQuestionBankItem,
  deleteQuestionBankItem,
  filterQuestionBank,
  getPopularQuestions,
  incrementQuestionUsage,
} from "../db/question-bank";

const router = Router();

// Apply middleware
router.use(authenticate);
router.use(auditLogging);

/**
 * GET /api/question-bank
 * Filter questions from the bank
 */
router.get(
  "/",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const filters = filterQuestionBankSchema.parse(req.query);
      const result = await filterQuestionBank(filters);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid filters", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to fetch questions" });
      }
    }
  }
);

/**
 * GET /api/question-bank/popular
 * Get most used questions
 */
router.get("/popular", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const questions = await getPopularQuestions(limit);
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch popular questions" });
  }
});

/**
 * GET /api/question-bank/:id
 * Get a specific question
 */
router.get("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const question = await getQuestionBankItem(req.params.id);
    if (!question) {
      res.status(404).json({ error: "Question not found" });
      return;
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch question" });
  }
});

/**
 * POST /api/question-bank
 * Create a new question (lecturer+ only)
 */
router.post(
  "/",
  authorize("lecturer", "admin", "super_admin"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = {
        ...req.body,
        createdBy: req.user!.id,
      };
      const question = await createQuestionBankItem(data);

      // Log audit event
      await req.logAudit?.({
        action: "create",
        resourceType: "question_bank",
        resourceId: question.id,
        changes: { created: question },
      });

      res.status(201).json(question);
    } catch (error) {
      res.status(500).json({ error: "Failed to create question" });
    }
  }
);

/**
 * PUT /api/question-bank/:id
 * Update a question (creator or admin)
 */
router.put(
  "/:id",
  authorize("lecturer", "admin", "super_admin"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const existing = await getQuestionBankItem(req.params.id);
      if (!existing) {
        res.status(404).json({ error: "Question not found" });
        return;
      }

      // Check if user is creator or admin
      const isCreator = existing.createdBy === String(req.user!.id);
      const isAdmin = ["admin", "super_admin"].includes(req.user!.role);
      if (!isCreator && !isAdmin) {
        res.status(403).json({ error: "You can only edit your own questions" });
        return;
      }

      const updated = await updateQuestionBankItem(req.params.id, req.body);

      // Log audit event
      await req.logAudit?.({
        action: "update",
        resourceType: "question_bank",
        resourceId: req.params.id,
        changes: { before: existing, after: updated },
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update question" });
    }
  }
);

/**
 * DELETE /api/question-bank/:id
 * Delete a question (creator or admin)
 */
router.delete(
  "/:id",
  authorize("lecturer", "admin", "super_admin"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const existing = await getQuestionBankItem(req.params.id);
      if (!existing) {
        res.status(404).json({ error: "Question not found" });
        return;
      }

      // Check if user is creator or admin
      const isCreator = existing.createdBy === String(req.user!.id);
      const isAdmin = ["admin", "super_admin"].includes(req.user!.role);
      if (!isCreator && !isAdmin) {
        res.status(403).json({ error: "You can only delete your own questions" });
        return;
      }

      const deleted = await deleteQuestionBankItem(req.params.id);

      // Log audit event
      await req.logAudit?.({
        action: "delete",
        resourceType: "question_bank",
        resourceId: req.params.id,
        changes: { deleted: existing },
      });

      res.json({ success: deleted });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete question" });
    }
  }
);

/**
 * POST /api/question-bank/:id/use
 * Increment usage count when a question is used in an exam
 */
router.post(
  "/:id/use",
  authorize("lecturer", "admin", "super_admin"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const question = await getQuestionBankItem(req.params.id);
      if (!question) {
        res.status(404).json({ error: "Question not found" });
        return;
      }

      await incrementQuestionUsage(req.params.id);
      res.json({ success: true, newUsageCount: question.usageCount + 1 });
    } catch (error) {
      res.status(500).json({ error: "Failed to update usage count" });
    }
  }
);

export default router;
