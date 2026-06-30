import { Router } from "express";
import {
  db,
  enrollmentsTable,
  coursesTable,
  examsTable,
  resultsTable,
  assignmentsTable,
  assignmentSubmissionsTable,
} from "@workspace/db";
import { eq, inArray, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import type { Request, Response } from "express";

const router = Router();

router.get("/my-grades", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { userId } = (req as any).user;

  // Courses student is enrolled in
  const enrollments = await db
    .select({ courseId: enrollmentsTable.courseId })
    .from(enrollmentsTable)
    .where(eq(enrollmentsTable.studentId, userId));

  if (enrollments.length === 0) {
    res.json([]);
    return;
  }

  const courseIds = enrollments.map((e) => e.courseId);

  // Load courses, exams, assignments concurrently
  const [courses, exams, assignments] = await Promise.all([
    db.select().from(coursesTable).where(inArray(coursesTable.id, courseIds)),
    db.select().from(examsTable).where(inArray(examsTable.courseId, courseIds)),
    db.select().from(assignmentsTable).where(inArray(assignmentsTable.courseId, courseIds)),
  ]);

  const examIds = exams.map((e) => e.id);
  const assignmentIds = assignments.map((a) => a.id);

  // Student's own results + submissions
  const [results, submissions] = await Promise.all([
    examIds.length > 0
      ? db
          .select()
          .from(resultsTable)
          .where(and(inArray(resultsTable.examId, examIds), eq(resultsTable.studentId, userId)))
      : Promise.resolve([]),
    assignmentIds.length > 0
      ? db
          .select()
          .from(assignmentSubmissionsTable)
          .where(
            and(
              inArray(assignmentSubmissionsTable.assignmentId, assignmentIds),
              eq(assignmentSubmissionsTable.studentId, userId)
            )
          )
      : Promise.resolve([]),
  ]);

  const gradebook = courses.map((course) => {
    const courseExams = exams.filter((e) => e.courseId === course.id);
    const courseAssignments = assignments.filter((a) => a.courseId === course.id);

    const examGrades = courseExams.map((exam) => {
      const result = results.find((r) => r.examId === exam.id);
      return {
        examId: exam.id,
        title: exam.title,
        durationMinutes: exam.durationMinutes,
        passingScore: exam.passingScore,
        submitted: !!result,
        score: result?.score ?? null,
        totalPoints: result?.totalPoints ?? null,
        percentage: result?.percentage ?? null,
        isPassed: result ? result.isPassed === 1 : null,
        gradingStatus: result?.gradingStatus ?? null,
        takenAt: result?.createdAt ?? null,
      };
    });

    const assignmentGrades = courseAssignments.map((assignment) => {
      const sub = submissions.find((s) => s.assignmentId === assignment.id);
      return {
        assignmentId: assignment.id,
        title: assignment.title,
        totalPoints: assignment.totalPoints,
        dueDate: assignment.dueDate,
        submitted: !!sub,
        grade: sub?.grade ?? null,
        feedback: sub?.feedback ?? null,
        status: sub?.status ?? null,
        submittedAt: sub?.submittedAt ?? null,
      };
    });

    // Weighted average across graded items only
    const pcts: number[] = [
      ...examGrades.filter((g) => g.percentage !== null).map((g) => g.percentage as number),
      ...assignmentGrades
        .filter((g) => g.grade !== null)
        .map((g) => ((g.grade as number) / g.totalPoints) * 100),
    ];

    const overallAverage =
      pcts.length > 0
        ? Math.round((pcts.reduce((a, b) => a + b, 0) / pcts.length) * 10) / 10
        : null;

    return {
      courseId: course.id,
      courseCode: course.code,
      courseName: course.name,
      examGrades,
      assignmentGrades,
      overallAverage,
      totalItems: examGrades.length + assignmentGrades.length,
      gradedItems: pcts.length,
    };
  });

  res.json(gradebook);
});

export default router;
