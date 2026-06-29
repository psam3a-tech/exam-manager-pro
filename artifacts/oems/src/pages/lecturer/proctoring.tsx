import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { AlertTriangle, CheckCircle, Shield } from "lucide-react";
import { useState } from "react";

const VIOLATION_LABELS: Record<string, string> = {
  tab_switch: "Tab Switch",
  fullscreen_exit: "Fullscreen Exit",
  copy_paste: "Copy/Paste",
  focus_lost: "Focus Lost",
  right_click: "Right Click",
  keyboard_shortcut: "Keyboard Shortcut",
};

const VIOLATION_COLOR: Record<string, string> = {
  tab_switch: "bg-red-100 text-red-700",
  fullscreen_exit: "bg-orange-100 text-orange-700",
  copy_paste: "bg-red-100 text-red-700",
  focus_lost: "bg-yellow-100 text-yellow-700",
  right_click: "bg-orange-100 text-orange-700",
  keyboard_shortcut: "bg-purple-100 text-purple-700",
};

export default function LecturerProctoringPage() {
  const [selectedExam, setSelectedExam] = useState<any | null>(null);

  const { data: exams = [], isLoading } = useQuery<any[]>({ queryKey: ["exams"], queryFn: () => api.get("/exams") });
  const { data: report = [], isLoading: reportLoading } = useQuery<any[]>({
    queryKey: ["proctoring-report", selectedExam?.id],
    queryFn: () => api.get(`/exams/${selectedExam.id}/proctoring-report`),
    enabled: !!selectedExam,
  });

  const totalViolations = report.reduce((sum: number, r: any) => sum + r.violationCount, 0);
  const flagged = report.filter((r: any) => r.violationCount >= 3);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-7 w-7" /> Proctoring Reports
          </h1>
          <p className="text-muted-foreground mt-1">Review academic integrity violations for your exams.</p>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Select Exam</label>
          <select
            className="border rounded-md px-3 py-2 text-sm bg-background w-full max-w-sm"
            value={selectedExam?.id ?? ""}
            onChange={(e) => setSelectedExam(exams.find((ex: any) => ex.id === Number(e.target.value)) ?? null)}
          >
            <option value="">Choose an exam...</option>
            {exams.map((ex: any) => <option key={ex.id} value={ex.id}>{ex.title}</option>)}
          </select>
        </div>

        {selectedExam && (
          reportLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Card key={i} className="h-24 animate-pulse bg-muted" />)}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{report.length}</div>
                    <p className="text-sm text-muted-foreground">Total Attempts</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-red-600">{totalViolations}</div>
                    <p className="text-sm text-muted-foreground">Total Violations</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-orange-600">{flagged.length}</div>
                    <p className="text-sm text-muted-foreground">Flagged ({">"}=3 violations)</p>
                  </CardContent>
                </Card>
              </div>

              {report.length === 0 ? (
                <Card>
                  <CardContent className="py-12 flex flex-col items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 opacity-40 text-green-500" />
                    <p className="text-sm">No attempts yet for this exam.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {report.map((r: any) => (
                    <Card key={r.attempt.id} className={r.violationCount >= 3 ? "border-red-400" : ""}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">Attempt #{r.attempt.id}</CardTitle>
                            <p className="text-xs text-muted-foreground">
                              Student ID: {r.attempt.studentId} · Started: {new Date(r.attempt.startedAt).toLocaleString()}
                              {r.attempt.submittedAt ? ` · Submitted: ${new Date(r.attempt.submittedAt).toLocaleString()}` : " · In Progress"}
                            </p>
                          </div>
                          {r.violationCount === 0 ? (
                            <Badge variant="outline" className="border-green-500 text-green-700 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" /> Clean
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> {r.violationCount} violation{r.violationCount !== 1 ? "s" : ""}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      {r.violations.length > 0 && (
                        <CardContent>
                          <div className="space-y-2">
                            {r.violations.map((v: any) => (
                              <div key={v.id} className="flex items-center gap-3 text-xs">
                                <span className={`px-2 py-0.5 rounded-full font-medium ${VIOLATION_COLOR[v.type] ?? "bg-muted text-muted-foreground"}`}>
                                  {VIOLATION_LABELS[v.type] ?? v.type}
                                </span>
                                <span className="text-muted-foreground">{new Date(v.occurredAt).toLocaleTimeString()}</span>
                                {v.description && <span className="text-muted-foreground">· {v.description}</span>}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  );
}
