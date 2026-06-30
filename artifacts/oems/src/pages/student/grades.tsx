import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, Download, TrendingUp, CheckCircle2, XCircle } from "lucide-react";

interface ExamGrade {
  examId: number;
  title: string;
  passingScore: number;
  submitted: boolean;
  score: number | null;
  totalPoints: number | null;
  percentage: number | null;
  isPassed: boolean | null;
  gradingStatus: string | null;
  takenAt: string | null;
}

interface AssignmentGrade {
  assignmentId: number;
  title: string;
  totalPoints: number;
  dueDate: string | null;
  submitted: boolean;
  grade: number | null;
  feedback: string | null;
  status: string | null;
  submittedAt: string | null;
}

interface CourseGrades {
  courseId: number;
  courseCode: string;
  courseName: string;
  examGrades: ExamGrade[];
  assignmentGrades: AssignmentGrade[];
  overallAverage: number | null;
  totalItems: number;
  gradedItems: number;
}

function avgColor(avg: number | null) {
  if (avg === null) return "text-muted-foreground";
  if (avg >= 70) return "text-green-700";
  if (avg >= 50) return "text-yellow-700";
  return "text-red-700";
}

function pctBadge(pct: number | null, isPassed: boolean | null) {
  if (pct === null) return <Badge variant="outline">Pending</Badge>;
  if (isPassed === true) return <Badge className="bg-green-100 text-green-800 border-green-300">{pct.toFixed(1)}%</Badge>;
  if (isPassed === false) return <Badge className="bg-red-100 text-red-800 border-red-300">{pct.toFixed(1)}%</Badge>;
  if (pct >= 70) return <Badge className="bg-green-100 text-green-800 border-green-300">{pct.toFixed(1)}%</Badge>;
  if (pct >= 50) return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">{pct.toFixed(1)}%</Badge>;
  return <Badge className="bg-red-100 text-red-800 border-red-300">{pct.toFixed(1)}%</Badge>;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function StudentGrades() {
  const { data: courses = [], isLoading } = useQuery<CourseGrades[]>({
    queryKey: ["my-grades"],
    queryFn: () => api.get("/my-grades"),
  });

  const [selectedId, setSelectedId] = useState<string>("");

  const course = useMemo(() => {
    if (!selectedId && courses.length > 0) return courses[0];
    return courses.find((c) => String(c.courseId) === selectedId) ?? courses[0];
  }, [courses, selectedId]);

  // Summary stats across all courses
  const overallStats = useMemo(() => {
    const avgs = courses.map((c) => c.overallAverage).filter((v): v is number => v !== null);
    const totalExams = courses.reduce((s, c) => s + c.examGrades.length, 0);
    const passedExams = courses.reduce(
      (s, c) => s + c.examGrades.filter((g) => g.isPassed === true).length,
      0
    );
    const totalAssignments = courses.reduce((s, c) => s + c.assignmentGrades.length, 0);
    const gradedAssignments = courses.reduce(
      (s, c) => s + c.assignmentGrades.filter((g) => g.grade !== null).length,
      0
    );
    return {
      overallAverage: avgs.length
        ? Math.round((avgs.reduce((a, b) => a + b, 0) / avgs.length) * 10) / 10
        : null,
      totalExams,
      passedExams,
      totalAssignments,
      gradedAssignments,
    };
  }, [courses]);

  function exportCSV() {
    if (!course) return;
    const examRows = course.examGrades.map((g) => [
      "Exam",
      g.title,
      g.submitted ? "Submitted" : "Not submitted",
      g.percentage !== null ? `${g.percentage.toFixed(1)}%` : "—",
      g.isPassed === true ? "Pass" : g.isPassed === false ? "Fail" : "—",
      formatDate(g.takenAt),
    ]);
    const assignmentRows = course.assignmentGrades.map((g) => {
      const pct = g.grade !== null ? ((g.grade / g.totalPoints) * 100).toFixed(1) : "—";
      return [
        "Assignment",
        g.title,
        g.submitted ? "Submitted" : "Not submitted",
        g.grade !== null ? `${pct}% (${g.grade}/${g.totalPoints})` : "—",
        g.status ?? "—",
        formatDate(g.submittedAt),
      ];
    });

    const header = ["Type", "Title", "Status", "Score", "Result", "Date"];
    const csv = [header, ...examRows, ...assignmentRows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grades-${course.courseCode}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">My Grades</h1>
            <p className="text-muted-foreground mt-1">Your exam scores and assignment grades across all courses.</p>
          </div>
          <div className="flex items-center gap-2">
            {courses.length > 1 && (
              <Select value={selectedId || String(courses[0]?.courseId)} onValueChange={setSelectedId}>
                <SelectTrigger className="w-52">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.courseId} value={String(c.courseId)}>
                      {c.courseCode} — {c.courseName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" size="sm" onClick={exportCSV} disabled={!course}>
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && courses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 space-y-3 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium text-muted-foreground">No grades yet</p>
            <p className="text-sm text-muted-foreground">Enroll in courses and complete exams or assignments to see your grades here.</p>
          </div>
        )}

        {!isLoading && courses.length > 0 && (
          <>
            {/* Summary stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg border bg-card p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Overall Avg</p>
                <p className={`text-2xl font-bold ${avgColor(overallStats.overallAverage)}`}>
                  {overallStats.overallAverage !== null ? `${overallStats.overallAverage}%` : "—"}
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Courses</p>
                <p className="text-2xl font-bold">{courses.length}</p>
              </div>
              <div className="rounded-lg border bg-card p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Exams Passed</p>
                <p className="text-2xl font-bold text-green-700">
                  {overallStats.passedExams}<span className="text-base text-muted-foreground font-normal">/{overallStats.totalExams}</span>
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Assignments</p>
                <p className="text-2xl font-bold text-primary">
                  {overallStats.gradedAssignments}<span className="text-base text-muted-foreground font-normal">/{overallStats.totalAssignments}</span>
                </p>
              </div>
            </div>

            {/* Course detail */}
            {course && (
              <div className="space-y-5">
                {/* Course header */}
                <div className="flex items-center gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{course.courseName}</h2>
                    <p className="text-sm text-muted-foreground">{course.courseCode}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className={`text-base font-bold ${avgColor(course.overallAverage)}`}>
                      {course.overallAverage !== null ? `${course.overallAverage}% avg` : "No grades yet"}
                    </span>
                  </div>
                </div>

                {/* Exams */}
                {course.examGrades.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Exams</h3>
                    <div className="rounded-lg border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="text-left p-3 font-medium">Exam</th>
                            <th className="text-center p-3 font-medium">Score</th>
                            <th className="text-center p-3 font-medium">Result</th>
                            <th className="text-center p-3 font-medium">Passing</th>
                            <th className="text-right p-3 font-medium">Date Taken</th>
                          </tr>
                        </thead>
                        <tbody>
                          {course.examGrades.map((g, i) => (
                            <tr key={g.examId} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                              <td className="p-3 font-medium">{g.title}</td>
                              <td className="p-3 text-center">
                                {!g.submitted ? (
                                  <span className="text-muted-foreground">Not taken</span>
                                ) : g.score !== null && g.totalPoints !== null ? (
                                  <span>{g.score}/{g.totalPoints}</span>
                                ) : (
                                  <span className="text-muted-foreground">Pending</span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                {!g.submitted ? (
                                  <Badge variant="outline" className="text-muted-foreground">Not taken</Badge>
                                ) : (
                                  pctBadge(g.percentage, g.isPassed)
                                )}
                              </td>
                              <td className="p-3 text-center">
                                {g.submitted && g.isPassed !== null ? (
                                  g.isPassed ? (
                                    <span className="flex items-center justify-center gap-1 text-green-700">
                                      <CheckCircle2 className="h-4 w-4" /> Pass
                                    </span>
                                  ) : (
                                    <span className="flex items-center justify-center gap-1 text-red-600">
                                      <XCircle className="h-4 w-4" /> Fail
                                    </span>
                                  )
                                ) : (
                                  <span className="text-muted-foreground">≥{g.passingScore}%</span>
                                )}
                              </td>
                              <td className="p-3 text-right text-muted-foreground text-xs">
                                {formatDate(g.takenAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Assignments */}
                {course.assignmentGrades.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Assignments</h3>
                    <div className="rounded-lg border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="text-left p-3 font-medium">Assignment</th>
                            <th className="text-center p-3 font-medium">Grade</th>
                            <th className="text-center p-3 font-medium">Status</th>
                            <th className="text-right p-3 font-medium">Due / Submitted</th>
                          </tr>
                        </thead>
                        <tbody>
                          {course.assignmentGrades.map((g, i) => {
                            const pct = g.grade !== null ? (g.grade / g.totalPoints) * 100 : null;
                            return (
                              <tr key={g.assignmentId} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                                <td className="p-3">
                                  <div className="font-medium">{g.title}</div>
                                  {g.feedback && (
                                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{g.feedback}</div>
                                  )}
                                </td>
                                <td className="p-3 text-center">
                                  {!g.submitted ? (
                                    <span className="text-muted-foreground">—</span>
                                  ) : g.grade !== null ? (
                                    <span className="font-medium">{g.grade}/{g.totalPoints}</span>
                                  ) : (
                                    <span className="text-yellow-700 text-xs">Awaiting grade</span>
                                  )}
                                </td>
                                <td className="p-3 text-center">
                                  {!g.submitted ? (
                                    <Badge variant="outline" className="text-muted-foreground">Not submitted</Badge>
                                  ) : pct !== null ? (
                                    pctBadge(pct, null)
                                  ) : (
                                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Ungraded</Badge>
                                  )}
                                </td>
                                <td className="p-3 text-right text-xs text-muted-foreground">
                                  {g.submittedAt ? (
                                    <span>Submitted {formatDate(g.submittedAt)}</span>
                                  ) : (
                                    <span>Due {formatDate(g.dueDate)}</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {course.examGrades.length === 0 && course.assignmentGrades.length === 0 && (
                  <div className="rounded-lg border bg-muted/30 py-12 text-center text-muted-foreground text-sm">
                    No exams or assignments found for this course yet.
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
