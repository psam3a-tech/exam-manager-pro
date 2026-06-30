import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, BookOpen } from "lucide-react";

interface ExamCol { examId: number; title: string; passingScore: number }
interface AssignmentCol { assignmentId: number; title: string; totalPoints: number }
interface ExamGrade { examId: number; title: string; score: number | null; totalPoints: number | null; percentage: number | null; isPassed: boolean | null; submitted: boolean }
interface AssignmentGrade { assignmentId: number; title: string; grade: number | null; totalPoints: number; submitted: boolean; graded: boolean }
interface StudentRow { studentId: number; name: string; email: string; studentIdCode: string | null; examGrades: ExamGrade[]; assignmentGrades: AssignmentGrade[]; overallAverage: number | null }
interface CourseGradebook { courseId: number; courseCode: string | null; courseName: string; exams: ExamCol[]; assignments: AssignmentCol[]; students: StudentRow[] }

function cellBg(value: number | null, isPassed: boolean | null, submitted: boolean, isExam: boolean) {
  if (!submitted) return "bg-muted/40 text-muted-foreground";
  if (value === null) return "bg-yellow-50 text-yellow-700";
  if (isExam) return isPassed ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700";
  const pct = value;
  if (pct >= 70) return "bg-green-50 text-green-800";
  if (pct >= 50) return "bg-yellow-50 text-yellow-700";
  return "bg-red-50 text-red-700";
}

function avgColor(avg: number | null) {
  if (avg === null) return "text-muted-foreground";
  if (avg >= 70) return "text-green-700 font-bold";
  if (avg >= 50) return "text-yellow-700 font-bold";
  return "text-red-700 font-bold";
}

export default function LecturerGradebook() {
  const { data: gradebook = [], isLoading } = useQuery<CourseGradebook[]>({
    queryKey: ["gradebook"],
    queryFn: () => api.get("/gradebook"),
  });

  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  const course = useMemo(() => {
    if (!selectedCourseId && gradebook.length > 0) return gradebook[0];
    return gradebook.find((c) => String(c.courseId) === selectedCourseId) ?? gradebook[0];
  }, [gradebook, selectedCourseId]);

  function exportCSV() {
    if (!course) return;
    const cols = [
      "Student Name",
      "Email",
      "Student ID",
      ...course.exams.map((e) => `Exam: ${e.title} (%)`),
      ...course.assignments.map((a) => `Assignment: ${a.title} (/${a.totalPoints})`),
      "Overall Average (%)",
    ];
    const rows = course.students.map((s) => [
      s.name,
      s.email,
      s.studentIdCode ?? "",
      ...s.examGrades.map((g) => (g.percentage !== null ? g.percentage.toFixed(1) : "—")),
      ...s.assignmentGrades.map((g) => (g.grade !== null ? g.grade.toFixed(1) : "—")),
      s.overallAverage !== null ? s.overallAverage.toFixed(1) : "—",
    ]);

    const csv = [cols, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gradebook-${course.courseCode ?? course.courseId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Class averages per column
  const classAverages = useMemo(() => {
    if (!course) return { exams: [], assignments: [], overall: null };
    const exams = course.exams.map((_, i) => {
      const vals = course.students.map((s) => s.examGrades[i]?.percentage).filter((v): v is number => v !== null);
      return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null;
    });
    const assignments = course.assignments.map((_, i) => {
      const vals = course.students.map((s) => s.assignmentGrades[i]?.grade).filter((v): v is number => v !== null);
      const totals = course.students.map((s) => s.assignmentGrades[i]?.totalPoints ?? 100);
      return vals.length ? Math.round((vals.reduce((a, b, idx) => a + (b / totals[idx]) * 100, 0) / vals.length) * 10) / 10 : null;
    });
    const overallVals = course.students.map((s) => s.overallAverage).filter((v): v is number => v !== null);
    const overall = overallVals.length
      ? Math.round((overallVals.reduce((a, b) => a + b, 0) / overallVals.length) * 10) / 10
      : null;
    return { exams, assignments, overall };
  }, [course]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Grade Book</h1>
            <p className="text-muted-foreground mt-1">
              Exam scores and assignment grades per student.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {gradebook.length > 1 && (
              <Select value={selectedCourseId || String(gradebook[0]?.courseId)} onValueChange={setSelectedCourseId}>
                <SelectTrigger className="w-52">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {gradebook.map((c) => (
                    <SelectItem key={c.courseId} value={String(c.courseId)}>
                      {c.courseCode ? `${c.courseCode} — ` : ""}{c.courseName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" size="sm" onClick={exportCSV} disabled={!course}>
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && gradebook.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <BookOpen className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-muted-foreground font-medium">No gradebook data yet</p>
            <p className="text-sm text-muted-foreground">
              Create assignments or exams for your courses and enroll students to see grades here.
            </p>
          </div>
        )}

        {!isLoading && course && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold">
                {course.courseCode && <span className="text-muted-foreground mr-1">{course.courseCode}</span>}
                {course.courseName}
              </h2>
              <Badge variant="outline">{course.students.length} students</Badge>
              <Badge variant="outline">{course.exams.length} exams</Badge>
              <Badge variant="outline">{course.assignments.length} assignments</Badge>
            </div>

            {course.students.length === 0 ? (
              <div className="rounded-lg border bg-muted/30 py-16 text-center text-muted-foreground text-sm">
                No enrolled students found for this course.
              </div>
            ) : (
              <div className="rounded-lg border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium sticky left-0 bg-muted/50 min-w-[180px]">
                        Student
                      </th>
                      {course.exams.map((e) => (
                        <th key={e.examId} className="text-center p-3 font-medium min-w-[110px]">
                          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Exam</div>
                          <div className="truncate max-w-[100px] mx-auto" title={e.title}>{e.title}</div>
                        </th>
                      ))}
                      {course.assignments.map((a) => (
                        <th key={a.assignmentId} className="text-center p-3 font-medium min-w-[110px]">
                          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Assignment</div>
                          <div className="truncate max-w-[100px] mx-auto" title={a.title}>{a.title}</div>
                        </th>
                      ))}
                      <th className="text-center p-3 font-medium min-w-[90px] bg-muted/50">
                        Average
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {course.students.map((student, si) => (
                      <tr key={student.studentId} className={si % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                        <td className="p-3 sticky left-0 bg-inherit">
                          <div className="font-medium truncate max-w-[160px]">{student.name}</div>
                          {student.studentIdCode && (
                            <div className="text-xs text-muted-foreground">{student.studentIdCode}</div>
                          )}
                        </td>
                        {student.examGrades.map((g) => (
                          <td key={g.examId} className="p-2 text-center">
                            <span className={`inline-flex items-center justify-center rounded px-2 py-1 text-xs font-medium w-full ${cellBg(g.percentage, g.isPassed, g.submitted, true)}`}>
                              {!g.submitted ? "—" : g.percentage !== null ? `${g.percentage.toFixed(1)}%` : "Pending"}
                            </span>
                          </td>
                        ))}
                        {student.assignmentGrades.map((g) => {
                          const pct = g.grade !== null ? (g.grade / g.totalPoints) * 100 : null;
                          return (
                            <td key={g.assignmentId} className="p-2 text-center">
                              <span className={`inline-flex items-center justify-center rounded px-2 py-1 text-xs font-medium w-full ${cellBg(pct, null, g.submitted, false)}`}>
                                {!g.submitted ? "—" : g.grade !== null ? `${g.grade}/${g.totalPoints}` : "Ungraded"}
                              </span>
                            </td>
                          );
                        })}
                        <td className={`p-3 text-center font-semibold ${avgColor(student.overallAverage)}`}>
                          {student.overallAverage !== null ? `${student.overallAverage}%` : "—"}
                        </td>
                      </tr>
                    ))}

                    {/* Class average row */}
                    <tr className="border-t-2 bg-muted/40 font-medium">
                      <td className="p-3 sticky left-0 bg-muted/40 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Class Avg
                      </td>
                      {classAverages.exams.map((avg, i) => (
                        <td key={i} className="p-2 text-center">
                          <span className={`text-xs font-semibold ${avgColor(avg)}`}>
                            {avg !== null ? `${avg}%` : "—"}
                          </span>
                        </td>
                      ))}
                      {classAverages.assignments.map((avg, i) => (
                        <td key={i} className="p-2 text-center">
                          <span className={`text-xs font-semibold ${avgColor(avg)}`}>
                            {avg !== null ? `${avg}%` : "—"}
                          </span>
                        </td>
                      ))}
                      <td className={`p-3 text-center text-sm ${avgColor(classAverages.overall)}`}>
                        {classAverages.overall !== null ? `${classAverages.overall}%` : "—"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
              <span className="font-medium">Legend:</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-100 border border-green-300 inline-block" /> Pass / ≥ 70%</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300 inline-block" /> 50–69% / Ungraded</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" /> Fail / &lt; 50%</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-muted border inline-block" /> Not submitted</span>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
