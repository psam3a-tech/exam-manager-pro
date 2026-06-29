import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { AlertTriangle, CheckCircle, Clock, FileText, Shield } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

type Question = { id: number; text: string; type: string; options?: string[]; points: number };
type Exam = { id: number; title: string; description?: string; durationMinutes: number; totalPoints: number; status: string; courseName?: string; questionCount: number };

function ExamTaker({ exam, attemptId, questions, onSubmit }: { exam: Exam; attemptId: number; questions: Question[]; onSubmit: () => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(exam.durationMinutes * 60);
  const [violations, setViolations] = useState<string[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const violationRef = useRef(0);

  const logViolation = useCallback(async (type: string, description: string) => {
    violationRef.current += 1;
    setViolations((v) => [...v, description]);
    try {
      await api.post(`/attempts/${attemptId}/violations`, { type, description });
    } catch {}
  }, [attemptId]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        logViolation("tab_switch", "Tab switched away from exam");
      }
    };
    const handleFullscreen = () => {
      if (!document.fullscreenElement) {
        logViolation("fullscreen_exit", "Exited fullscreen mode");
      }
    };
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      logViolation("right_click", "Right-click attempted");
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "v" || e.key === "a")) {
        logViolation("keyboard_shortcut", `Keyboard shortcut Ctrl+${e.key.toUpperCase()} detected`);
      }
    };
    const handleBlur = () => {
      logViolation("focus_lost", "Window lost focus");
    };

    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("fullscreenchange", handleFullscreen);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("fullscreenchange", handleFullscreen);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("blur", handleBlur);
    };
  }, [logViolation]);

  useEffect(() => {
    if (timeLeft <= 0) { onSubmit(); return; }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onSubmit]);

  const saveAnswer = async (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    try {
      await api.post(`/attempts/${attemptId}/answers`, { questionId, answer });
    } catch {}
  };

  const handleSubmit = async () => {
    try {
      await api.post(`/attempts/${attemptId}/submit`, {});
      onSubmit();
    } catch { onSubmit(); }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft < 300;
  const q = questions[currentQ];

  return (
    <div className="min-h-screen bg-background flex flex-col select-none" onCopy={(e) => e.preventDefault()}>
      <div className="sticky top-0 z-10 bg-card border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-semibold">{exam.title}</span>
          {violations.length > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> {violations.length} violation{violations.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        <div className={`flex items-center gap-2 font-mono font-bold text-lg ${isLowTime ? "text-red-600 animate-pulse" : ""}`}>
          <Clock className="h-5 w-5" />
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-48 border-r bg-muted/30 p-4 overflow-y-auto hidden md:block">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Questions</p>
          <div className="grid grid-cols-4 gap-1.5">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQ(i)}
                className={`w-8 h-8 rounded text-xs font-medium transition-colors
                  ${i === currentQ ? "bg-primary text-primary-foreground" : answers[questions[i].id] ? "bg-green-500/20 text-green-700 border border-green-500/30" : "bg-background border hover:bg-accent"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="mt-4 space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-green-500/20 border border-green-500/30 inline-block" /> Answered</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-background border inline-block" /> Unanswered</div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full">
          {q && (
            <div key={q.id} className="space-y-6">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Question {currentQ + 1} of {questions.length} · {q.points} pt{q.points !== 1 ? "s" : ""}</p>
                <p className="text-base font-medium leading-relaxed">{q.text}</p>
              </div>

              {q.type === "mcq" && q.options && (
                <div className="space-y-3">
                  {q.options.map((opt, i) => (
                    <label key={i} className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${answers[q.id] === opt ? "border-primary bg-primary/5" : "hover:bg-accent"}`}>
                      <input type="radio" name={`q_${q.id}`} value={opt} checked={answers[q.id] === opt} onChange={() => saveAnswer(q.id, opt)} className="accent-primary" />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              )}
              {q.type === "true_false" && (
                <div className="flex gap-4">
                  {["True", "False"].map((opt) => (
                    <label key={opt} className={`flex-1 flex items-center justify-center gap-2 p-4 border rounded-lg cursor-pointer transition-colors ${answers[q.id] === opt ? "border-primary bg-primary/5" : "hover:bg-accent"}`}>
                      <input type="radio" name={`q_${q.id}`} value={opt} checked={answers[q.id] === opt} onChange={() => saveAnswer(q.id, opt)} className="accent-primary" />
                      <span className="font-medium">{opt}</span>
                    </label>
                  ))}
                </div>
              )}
              {(q.type === "fill_blank" || q.type === "short_answer") && (
                <input
                  type="text"
                  className="w-full border rounded-lg p-3 text-sm"
                  placeholder="Type your answer..."
                  value={answers[q.id] ?? ""}
                  onChange={(e) => saveAnswer(q.id, e.target.value)}
                />
              )}
              {q.type === "essay" && (
                <textarea
                  className="w-full border rounded-lg p-3 text-sm min-h-[160px] resize-y"
                  placeholder="Write your answer here..."
                  value={answers[q.id] ?? ""}
                  onChange={(e) => saveAnswer(q.id, e.target.value)}
                />
              )}
              {q.type === "matching" && (
                <textarea
                  className="w-full border rounded-lg p-3 text-sm min-h-[100px]"
                  placeholder="Enter your matching answers..."
                  value={answers[q.id] ?? ""}
                  onChange={(e) => saveAnswer(q.id, e.target.value)}
                />
              )}
              {q.type === "code" && (
                <textarea
                  className="w-full border rounded-lg p-3 text-sm font-mono min-h-[200px] resize-y bg-muted"
                  placeholder="Write your code here..."
                  value={answers[q.id] ?? ""}
                  onChange={(e) => saveAnswer(q.id, e.target.value)}
                />
              )}
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button variant="outline" onClick={() => setCurrentQ((i) => Math.max(0, i - 1))} disabled={currentQ === 0}>← Previous</Button>
            {currentQ < questions.length - 1 ? (
              <Button onClick={() => setCurrentQ((i) => i + 1)}>Next →</Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle className="h-4 w-4 mr-2" /> Submit Exam
              </Button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function StudentExamsPage() {
  const { data: exams = [], isLoading } = useQuery<Exam[]>({ queryKey: ["exams"], queryFn: () => api.get("/exams?status=active") });
  const [takingExam, setTakingExam] = useState<{ exam: Exam; attemptId: number; questions: Question[] } | null>(null);
  const [submittedMsg, setSubmittedMsg] = useState<string | null>(null);
  const qc = useQueryClient();

  const startExam = async (exam: Exam) => {
    try {
      const attempt = await api.post<{ id: number }>("/attempts", { examId: exam.id });
      const questions = await api.get<Question[]>(`/exams/${exam.id}/questions`);
      setTakingExam({ exam, attemptId: attempt.id, questions });
      setSubmittedMsg(null);
    } catch (e: any) { alert(e.message ?? "Failed to start exam"); }
  };

  const handleSubmit = () => {
    setTakingExam(null);
    setSubmittedMsg("Exam submitted successfully! Results will be available soon.");
    qc.invalidateQueries({ queryKey: ["exams"] });
  };

  if (takingExam) {
    return <ExamTaker exam={takingExam.exam} attemptId={takingExam.attemptId} questions={takingExam.questions} onSubmit={handleSubmit} />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Exams</h1>
          <p className="text-muted-foreground mt-1">Take exams for your enrolled courses. Exams are monitored for academic integrity.</p>
        </div>

        {submittedMsg && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm">
            <CheckCircle className="h-4 w-4 shrink-0" /> {submittedMsg}
          </div>
        )}

        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg px-4 py-3 text-sm">
          <Shield className="h-4 w-4 shrink-0" />
          <span>Exams are proctored. Tab switching, window blur, and right-clicking are logged as violations.</span>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => <Card key={i} className="h-48 animate-pulse bg-muted" />)}
          </div>
        ) : exams.length === 0 ? (
          <Card>
            <CardContent className="py-12 flex flex-col items-center gap-2 text-muted-foreground">
              <FileText className="h-8 w-8 opacity-40" />
              <p className="text-sm">No active exams at this time.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {exams.map((exam) => (
              <Card key={exam.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{exam.title}</CardTitle>
                    <Badge variant="default">{exam.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{exam.courseName}</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-3">
                  {exam.description && <p className="text-sm text-muted-foreground">{exam.description}</p>}
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div><span className="font-medium text-foreground">{exam.durationMinutes}</span> min</div>
                    <div><span className="font-medium text-foreground">{exam.totalPoints}</span> pts</div>
                    <div><span className="font-medium text-foreground">{exam.questionCount}</span> Qs</div>
                  </div>
                  <Button onClick={() => startExam(exam)} className="w-full mt-auto">
                    <FileText className="h-4 w-4 mr-2" /> Start Exam
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
