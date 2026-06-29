import { Router } from "express";
import { db, usersTable, coursesTable, examsTable, attemptsTable, resultsTable, enrollmentsTable } from "@workspace/db";
import { eq, avg, count, max, min, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import type { Request, Response } from "express";

const router = Router();

router.get("/analytics/overview", requireAuth, async (_req: Request, res: Response): Promise<void> => {
  const [studentsCount] = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.role, "student"));
  const [lecturersCount] = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.role, "lecturer"));
  const [coursesCount] = await db.select({ count: count() }).from(coursesTable);
  const [examsCount] = await db.select({ count: count() }).from(examsTable);
  const [activeExamsCount] = await db.select({ count: count() }).from(examsTable).where(eq(examsTable.status, "active"));
  const [attemptsCount] = await db.select({ count: count() }).from(attemptsTable);
  const [avgResult] = await db.select({ avg: avg(resultsTable.percentage) }).from(resultsTable);

  const results = await db.select().from(resultsTable).orderBy(resultsTable.createdAt).limit(100);
  const passCount = results.filter(r => r.isPassed === 1).length;
  const passRate = results.length > 0 ? (passCount / results.length) * 100 : 0;

  const allExams = await db.select().from(examsTable);
  const examsByStatus = ["draft", "published", "active", "closed"].map(status => ({
    label: status,
    count: allExams.filter(e => e.status === status).length,
  }));

  const scoreRanges = [
    { label: "0-20%", min: 0, max: 20 },
    { label: "21-40%", min: 21, max: 40 },
    { label: "41-60%", min: 41, max: 60 },
    { label: "61-80%", min: 61, max: 80 },
    { label: "81-100%", min: 81, max: 100 },
  ];
  const scoreDistribution = scoreRanges.map(range => ({
    label: range.label,
    count: results.filter(r => r.percentage >= range.min && r.percentage <= range.max).length,
  }));

  const recentAttempts = await db.select().from(attemptsTable).orderBy(attemptsTable.startedAt).limit(5);
  const recentActivity = await Promise.all(recentAttempts.map(async (a) => {
    const [s] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, a.studentId)).limit(1);
    const [e] = await db.select({ title: examsTable.title }).from(examsTable).where(eq(examsTable.id, a.examId)).limit(1);
    return {
      type: "exam_attempt",
      description: `${s?.name ?? "Student"} started "${e?.title ?? "exam"}"`,
      createdAt: a.startedAt.toISOString(),
    };
  }));

  res.json({
    totalStudents: Number(studentsCount?.count ?? 0),
    totalLecturers: Number(lecturersCount?.count ?? 0),
    totalCourses: Number(coursesCount?.count ?? 0),
    totalExams: Number(examsCount?.count ?? 0),
    activeExams: Number(activeExamsCount?.count ?? 0),
    totalAttempts: Number(attemptsCount?.count ?? 0),
    averageScore: Number(avgResult?.avg ?? 0),
    passRate,
    recentActivity,
    examsByStatus,
    scoreDistribution,
  });
});

router.get("/analytics/exams/:examId", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const examId = Number(req.params.examId);
  const [exam] = await db.select().from(examsTable).where(eq(examsTable.id, examId)).limit(1);
  if (!exam) { res.status(404).json({ error: "Not found" }); return; }

  const examResults = await db.select().from(resultsTable).where(eq(resultsTable.examId, examId));
  const totalAttempts = examResults.length;
  const avgScore = totalAttempts > 0 ? examResults.reduce((s, r) => s + r.percentage, 0) / totalAttempts : 0;
  const passCount = examResults.filter(r => r.isPassed === 1).length;
  const passRate = totalAttempts > 0 ? (passCount / totalAttempts) * 100 : 0;
  const highest = totalAttempts > 0 ? Math.max(...examResults.map(r => r.score)) : 0;
  const lowest = totalAttempts > 0 ? Math.min(...examResults.map(r => r.score)) : 0;

  const scoreRanges = [
    { label: "0-20%", min: 0, max: 20 },
    { label: "21-40%", min: 21, max: 40 },
    { label: "41-60%", min: 41, max: 60 },
    { label: "61-80%", min: 61, max: 80 },
    { label: "81-100%", min: 81, max: 100 },
  ];
  const scoreDistribution = scoreRanges.map(range => ({
    label: range.label,
    count: examResults.filter(r => r.percentage >= range.min && r.percentage <= range.max).length,
  }));

  res.json({
    examId,
    examTitle: exam.title,
    totalAttempts,
    averageScore: avgScore,
    passRate,
    highestScore: highest,
    lowestScore: lowest,
    questionPerformance: [],
    scoreDistribution,
  });
});

router.get("/analytics/students/:studentId", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const studentId = Number(req.params.studentId);
  const [student] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, studentId)).limit(1);

  const studentResults = await db.select().from(resultsTable).where(eq(resultsTable.studentId, studentId)).orderBy(resultsTable.createdAt);
  const totalAttempts = studentResults.length;
  const avgScore = totalAttempts > 0 ? studentResults.reduce((s, r) => s + r.percentage, 0) / totalAttempts : 0;
  const passCount = studentResults.filter(r => r.isPassed === 1).length;
  const passRate = totalAttempts > 0 ? (passCount / totalAttempts) * 100 : 0;

  const enrollments = await db.select().from(enrollmentsTable).where(eq(enrollmentsTable.studentId, studentId));
  const coursePerformance = await Promise.all(enrollments.map(async (e) => {
    const [c] = await db.select({ name: coursesTable.name }).from(coursesTable).where(eq(coursesTable.id, e.courseId)).limit(1);
    const courseExams = await db.select().from(examsTable).where(eq(examsTable.courseId, e.courseId));
    const examIds = courseExams.map(ex => ex.id);
    const courseResults = studentResults.filter(r => examIds.includes(r.examId));
    const courseAvg = courseResults.length > 0 ? courseResults.reduce((s, r) => s + r.percentage, 0) / courseResults.length : 0;
    return {
      courseId: e.courseId,
      courseName: c?.name ?? "",
      averageScore: courseAvg,
      examCount: courseExams.length,
    };
  }));

  const recentResults = studentResults.slice(-5).reverse();
  const formattedRecent = await Promise.all(recentResults.map(async (r) => {
    const [ex] = await db.select({ title: examsTable.title }).from(examsTable).where(eq(examsTable.id, r.examId)).limit(1);
    return {
      id: r.id, attemptId: r.attemptId, studentId: r.studentId, studentName: student?.name ?? null,
      examId: r.examId, examTitle: ex?.title ?? null, score: r.score, totalPoints: r.totalPoints,
      percentage: r.percentage, isPassed: r.isPassed === 1, gradingStatus: r.gradingStatus,
      createdAt: r.createdAt.toISOString(),
    };
  }));

  res.json({
    studentId,
    studentName: student?.name ?? "",
    totalAttempts,
    averageScore: avgScore,
    passRate,
    recentResults: formattedRecent,
    coursePerformance,
  });
});

router.get("/analytics/lecturer/:lecturerId", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const lecturerId = Number(req.params.lecturerId);
  const [lecturer] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, lecturerId)).limit(1);
  const courses = await db.select().from(coursesTable).where(eq(coursesTable.lecturerId, lecturerId));
  const courseIds = courses.map(c => c.id);

  let totalStudents = 0;
  const examSummaries = [];

  for (const c of courses) {
    const [enrollCount] = await db.select({ count: count() }).from(enrollmentsTable).where(eq(enrollmentsTable.courseId, c.id));
    totalStudents += Number(enrollCount?.count ?? 0);
  }

  const allExams = courseIds.length > 0
    ? await db.select().from(examsTable).where(eq(examsTable.courseId, courses[0]?.id ?? 0))
    : [];

  for (const exam of allExams) {
    const examResults = await db.select().from(resultsTable).where(eq(resultsTable.examId, exam.id));
    const avgScore = examResults.length > 0 ? examResults.reduce((s, r) => s + r.percentage, 0) / examResults.length : 0;
    const passCount = examResults.filter(r => r.isPassed === 1).length;
    examSummaries.push({
      examId: exam.id,
      examTitle: exam.title,
      attemptCount: examResults.length,
      averageScore: avgScore,
      passRate: examResults.length > 0 ? (passCount / examResults.length) * 100 : 0,
    });
  }

  const allExamResults = await db.select().from(resultsTable);
  const courseExamIds = new Set(allExams.map(e => e.id));
  const relevantResults = allExamResults.filter(r => courseExamIds.has(r.examId));
  const avgClassScore = relevantResults.length > 0 ? relevantResults.reduce((s, r) => s + r.percentage, 0) / relevantResults.length : 0;

  res.json({
    lecturerId,
    lecturerName: lecturer?.name ?? "",
    totalCourses: courses.length,
    totalExams: allExams.length,
    totalStudents,
    averageClassScore: avgClassScore,
    examSummaries,
  });
});

export default router;
