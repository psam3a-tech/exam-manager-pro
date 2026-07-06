import { Router, Response } from "express";
import { AuthenticatedRequest, authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { getLatestExamSnapshot, getExamSnapshotHistory, savePerformanceSnapshot } from "../db/performance-snapshots";
import { db } from "@workspace/db";
import { attemptsTable, resultsTable, examsTable, coursesTable, enrollmentsTable, usersTable } from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";

const router = Router();

// Apply middleware
router.use(authenticate);

/**
 * GET /api/analytics/exam/:examId
 * Get analytics for a specific exam
 */
router.get(
  "/exam/:examId",
  authorize("lecturer", "admin", "super_admin"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const examId = parseInt(req.params.examId);
      const snapshot = await getLatestExamSnapshot(examId);
      
      if (!snapshot) {
        res.status(404).json({ error: "No analytics found for this exam" });
        return;
      }

      res.json({
        examId: snapshot.examId,
        totalAttempts: snapshot.totalAttempts,
        uniqueStudents: snapshot.uniqueStudents,
        meanScore: snapshot.meanScore,
        medianScore: snapshot.medianScore,
        minScore: snapshot.minScore,
        maxScore: snapshot.maxScore,
        stdDeviation: snapshot.stdDeviation,
        passPercentage: snapshot.passPercentage,
        failPercentage: snapshot.failPercentage,
        scoreDistribution: snapshot.scoreDistribution ? JSON.parse(snapshot.scoreDistribution) : {},
        takenAt: snapshot.takenAt,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch exam analytics" });
    }
  }
);

/**
 * GET /api/analytics/exam/:examId/history
 * Get analytics history for trend analysis
 */
router.get(
  "/exam/:examId/history",
  authorize("lecturer", "admin", "super_admin"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const examId = parseInt(req.params.examId);
      const snapshots = await getExamSnapshotHistory(examId);
      
      const formattedSnapshots = snapshots.map((s) => ({
        meanScore: s.meanScore,
        passPercentage: s.passPercentage,
        totalAttempts: s.totalAttempts,
        takenAt: s.takenAt,
      }));

      res.json(formattedSnapshots);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics history" });
    }
  }
);

/**
 * GET /api/analytics/student/:studentId
 * Get analytics for a specific student across all courses
 */
router.get(
  "/student/:studentId",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const studentId = parseInt(req.params.studentId);
      
      // Only allow students to see their own data, admins can see all
      if (req.user!.role === "student" && req.user!.id !== studentId) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      // Get student's course enrollments
      const courseResults = await db
        .select({
          courseId: coursesTable.id,
          courseName: coursesTable.name,
          examCount: db.selectDistinct().from(examsTable).where(eq(examsTable.courseId, coursesTable.id)),
          averageScore: resultsTable.score,
          isPassed: resultsTable.isPassed,
        })
        .from(enrollmentsTable)
        .innerJoin(coursesTable, eq(enrollmentsTable.courseId, coursesTable.id))
        .leftJoin(resultsTable, eq(enrollmentsTable.studentId, resultsTable.attemptId))
        .where(eq(enrollmentsTable.studentId, studentId));

      res.json(courseResults);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch student analytics" });
    }
  }
);

/**
 * GET /api/analytics/course/:courseId
 * Get analytics for a specific course
 */
router.get(
  "/course/:courseId",
  authorize("lecturer", "admin", "super_admin"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const courseId = parseInt(req.params.courseId);

      // Get all exams in the course
      const courseExams = await db
        .select()
        .from(examsTable)
        .where(eq(examsTable.courseId, courseId));

      // Get aggregated statistics
      const stats = await db
        .select({
          totalAttempts: attemptsTable,
          averageScore: resultsTable.score,
          passCount: resultsTable.isPassed,
        })
        .from(attemptsTable)
        .innerJoin(resultsTable, eq(attemptsTable.id, resultsTable.attemptId))
        .where(
          eq(
            examsTable.courseId,
            courseId
          )
        );

      res.json({
        courseId,
        totalExams: courseExams.length,
        recentExams: courseExams.slice(-5),
        statistics: stats,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch course analytics" });
    }
  }
);

/**
 * GET /api/analytics/dashboard
 * Get dashboard-level analytics (admin/super_admin)
 */
router.get(
  "/dashboard",
  authorize("admin", "super_admin"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Count totals
      const totalStudents = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.role, "student"));
      
      const totalCourses = await db.select().from(coursesTable);
      
      const totalExams = await db.select().from(examsTable);

      // Get overall statistics
      const overallStats = await db
        .select({
          meanScore: resultsTable.score,
          isPassed: resultsTable.isPassed,
        })
        .from(resultsTable);

      const meanScores = overallStats.map((s) => s.meanScore).filter((s) => s !== null) as number[];
      const passedCount = overallStats.filter((s) => s.isPassed).length;

      const averageClassScore = meanScores.length > 0 
        ? meanScores.reduce((a, b) => a + b, 0) / meanScores.length 
        : 0;
      
      const overallPassPercentage = overallStats.length > 0
        ? (passedCount / overallStats.length) * 100
        : 0;

      res.json({
        totalStudents: totalStudents.length,
        totalCourses: totalCourses.length,
        totalExams: totalExams.length,
        averageClassScore: averageClassScore.toFixed(2),
        overallPassPercentage: overallPassPercentage.toFixed(2),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard analytics" });
    }
  }
);

export default router;
