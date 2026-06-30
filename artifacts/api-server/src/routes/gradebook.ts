import { Router } from "express";
import {
  db,
  assignmentsTable,
  assignmentSubmissionsTable,
  examsTable,
  resultsTable,
  enrollmentsTable,
  usersTable,
  coursesTable,
} from "@workspace/db";
import { eq, inArray, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import type { Request, Response } from "express";

const router = Router();

router.get("/gradebook", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const authUser = (req as any).user;

  // Find courses this lecturer owns via assignments
  const ownedCourses = await db
    .selectDistinct({ courseId: assignmentsTable.courseId })
    .from(assignmentsTable)
    .where(eq(assignmentsTable.lecturerId, authUser.userId));

  const lecturerCourseIds = ownedCourses.map((r) => r.courseId);
  if (lecturerCourseIds.length === 0) {
    res.json([]);
    return;
  }

  // Course details
  const courses = await db
    .select()
    .from(coursesTable)
    .where(inArray(coursesTable.id, lecturerCourseIds));

  // Exams + assignments for those courses
  const [exams, assignments] = await Promise.all([
    db.select().from(examsTable).where(inArray(examsTable.courseId, lecturerCourseIds)),
    db
      .select()
      .from(assignmentsTable)
      .where(
        and(
          inArray(assignmentsTable.courseId, lecturerCourseIds),
          eq(assignmentsTable.lecturerId, authUser.userId)
        )
      ),
  ]);

  // Enrolled students
  const enrollments = await db
    .select({ studentId: enrollmentsTable.studentId, courseId: enrollmentsTable.courseId })
    .from(enrollmentsTable)
    .where(inArray(enrollmentsTable.courseId, lecturerCourseIds));

  const studentIds = [...new Set(enrollments.map((e) => e.studentId))];

  const students =
    studentIds.length > 0
      ? await db
          .select({
            id: usersTable.id,
            name: usersTable.name,
            email: usersTable.email,
            studentId: usersTable.studentId,
          })
          .from(usersTable)
          .where(inArray(usersTable.id, studentIds))
      : [];

  // Results + submissions
  const examIds = exams.map((e) => e.id);
  const assignmentIds = assignments.map((a) => a.id);

  const [results, submissions] = await Promise.all([
    examIds.length > 0 && studentIds.length > 0
      ? db
          .select()
          .from(resultsTable)
          .where(
            and(
              inArray(resultsTable.examId, examIds),
              inArray(resultsTable.studentId, studentIds)
            )
          )
      : Promise.resolve([]),
    assignmentIds.length > 0 && studentIds.length > 0
      ? db
          .select()
          .from(assignmentSubmissionsTable)
          .where(
            and(
              inArray(assignmentSubmissionsTable.assignmentId, assignmentIds),
              inArray(assignmentSubmissionsTable.studentId, studentIds)
            )
          )
      : Promise.resolve([]),
  ]);

  // Build per-course gradebook
  const gradebook = courses.map((course) => {
    const courseExams = exams.filter((e) => e.courseId === course.id);
    const courseAssignments = assignments.filter((a) => a.courseId === course.id);
    const courseStudentIds = enrollments.filter((e) => e.courseId === course.id).map((e) => e.studentId);
    const courseStudents = students.filter((s) => courseStudentIds.includes(s.id));

    const studentRows = courseStudents.map((student) => {
      const examGrades = courseExams.map((exam) => {
        const result = results.find((r) => r.examId === exam.id && r.studentId === student.id);
        return {
          examId: exam.id,
          title: exam.title,
          score: result?.score ?? null,
          totalPoints: result?.totalPoints ?? null,
          percentage: result?.percentage ?? null,
          isPassed: result ? result.isPassed === 1 : null,
          submitted: !!result,
        };
      });

      const assignmentGrades = courseAssignments.map((assignment) => {
        const sub = submissions.find(
          (s) => s.assignmentId === assignment.id && s.studentId === student.id
        );
        return {
          assignmentId: assignment.id,
          title: assignment.title,
          grade: sub?.grade ?? null,
          totalPoints: assignment.totalPoints,
          submitted: !!sub,
          graded: sub?.status === "graded" || sub?.status === "returned",
        };
      });

      const percentages: number[] = [
        ...examGrades.filter((g) => g.percentage !== null).map((g) => g.percentage as number),
        ...assignmentGrades
          .filter((g) => g.grade !== null)
          .map((g) => ((g.grade as number) / g.totalPoints) * 100),
      ];

      const overallAverage =
        percentages.length > 0
          ? Math.round((percentages.reduce((a, b) => a + b, 0) / percentages.length) * 10) / 10
          : null;

      return {
        studentId: student.id,
        name: student.name,
        email: student.email,
        studentIdCode: student.studentId,
        examGrades,
        assignmentGrades,
        overallAverage,
      };
    });

    return {
      courseId: course.id,
      courseCode: course.code ?? null,
      courseName: course.name,
      exams: courseExams.map((e) => ({ examId: e.id, title: e.title, passingScore: e.passingScore })),
      assignments: courseAssignments.map((a) => ({
        assignmentId: a.id,
        title: a.title,
        totalPoints: a.totalPoints,
      })),
      students: studentRows,
    };
  });

  res.json(gradebook);
});

export default router;
