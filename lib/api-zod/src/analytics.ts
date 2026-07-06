import { z } from "zod/v4";

export const examAnalyticsSchema = z.object({
  examId: z.number(),
  totalAttempts: z.number(),
  uniqueStudents: z.number(),
  meanScore: z.number(),
  medianScore: z.number(),
  minScore: z.number(),
  maxScore: z.number(),
  stdDeviation: z.number(),
  passPercentage: z.number(),
  failPercentage: z.number(),
  scoreDistribution: z.record(z.string(), z.number()), // e.g., { "0-20": 5, "20-40": 10, ... }
});

export const studentPerformanceSchema = z.object({
  studentId: z.number(),
  studentName: z.string(),
  courseId: z.number(),
  courseName: z.string(),
  examCount: z.number(),
  averageScore: z.number(),
  passCount: z.number(),
  failCount: z.number(),
  trend: z.enum(["improving", "declining", "stable"]),
});

export const courseAnalyticsSchema = z.object({
  courseId: z.number(),
  courseName: z.string(),
  totalExams: z.number(),
  totalAttempts: z.number(),
  meanScore: z.number(),
  passPercentage: z.number(),
  topPerformers: z.array(studentPerformanceSchema).optional(),
  strugglingStudents: z.array(studentPerformanceSchema).optional(),
});

export const dashboardAnalyticsSchema = z.object({
  totalStudents: z.number(),
  totalCourses: z.number(),
  totalExams: z.number(),
  pendingExams: z.number(),
  averageClassScore: z.number(),
  overallPassPercentage: z.number(),
  recentExams: z.array(examAnalyticsSchema).optional(),
  topCourses: z.array(courseAnalyticsSchema).optional(),
});

export type ExamAnalytics = z.infer<typeof examAnalyticsSchema>;
export type StudentPerformance = z.infer<typeof studentPerformanceSchema>;
export type CourseAnalytics = z.infer<typeof courseAnalyticsSchema>;
export type DashboardAnalytics = z.infer<typeof dashboardAnalyticsSchema>;
