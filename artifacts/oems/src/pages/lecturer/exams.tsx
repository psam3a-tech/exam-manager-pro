import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { FileText, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

const QUESTION_TYPES = ["mcq", "true_false", "fill_blank", "essay", "matching", "code"];

function ExamForm({ courses, onClose, onSave }: { courses: any[]; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ courseId: "", title: "", description: "", durationMinutes: "60", passingScore: "50", status: "draft" });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.courseId || !form.title) { alert("Fill required fields"); return; }
    setSaving(true);
    try {
      await api.post("/exams", { ...form, courseId: Number(form.courseId), durationMinutes: Number(form.durationMinutes), passingScore: Number(form.passingScore) });
      onSave(); onClose();
    } catch (e: any) { alert(e.message); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border p-6 w-full max-w-md space-y-4">
        <h2 className="text-lg font-bold">Create Exam</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Course *</label>
            <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.courseId} onChange={(e) => set("courseId", e.target.value)}>
              <option value="">Select course...</option>
              {courses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Title *</label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Exam title..." />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Description</label>
            <textarea className="w-full border rounded-md px-3 py-2 text-sm min-h-[70px]" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Instructions..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Duration (min)</label>
              <Input type="number" value={form.durationMinutes} onChange={(e) => set("durationMinutes", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Passing Score (%)</label>
              <Input type="number" value={form.passingScore} onChange={(e) => set("passingScore", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Status</label>
            <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Create"}</Button>
        </div>
      </div>
    </div>
  );
}

function QuestionForm({ examId, onClose, onSave }: { examId: number; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ text: "", type: "mcq", points: "5", options: ["", "", "", ""], correctAnswer: "", difficulty: "medium" });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.text) { alert("Question text required"); return; }
    setSaving(true);
    try {
      const opts = form.type === "mcq" ? form.options.filter(Boolean) : undefined;
      const q = await api.post<{ id: number }>("/questions", {
        text: form.text, type: form.type, points: Number(form.points),
        options: opts, correctAnswer: form.correctAnswer || null, difficulty: form.difficulty,
        courseId: null,
      });
      await api.post(`/exams/${examId}/questions`, { questionId: q.id });
      onSave(); onClose();
    } catch (e: any) { alert(e.message); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold">Add Question</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Type</label>
            <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.type} onChange={(e) => set("type", e.target.value)}>
              {QUESTION_TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ").toUpperCase()}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Question *</label>
            <textarea className="w-full border rounded-md px-3 py-2 text-sm min-h-[80px]" value={form.text} onChange={(e) => set("text", e.target.value)} placeholder="Enter question..." />
          </div>
          {form.type === "mcq" && (
            <div>
              <label className="text-sm font-medium mb-1 block">Options</label>
              {form.options.map((opt, i) => (
                <Input key={i} className="mb-2" value={opt} onChange={(e) => { const o = [...form.options]; o[i] = e.target.value; set("options", o); }} placeholder={`Option ${i + 1}`} />
              ))}
            </div>
          )}
          {(form.type === "mcq" || form.type === "true_false" || form.type === "fill_blank") && (
            <div>
              <label className="text-sm font-medium mb-1 block">Correct Answer</label>
              {form.type === "true_false" ? (
                <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.correctAnswer} onChange={(e) => set("correctAnswer", e.target.value)}>
                  <option value="">Select...</option>
                  <option value="True">True</option>
                  <option value="False">False</option>
                </select>
              ) : (
                <Input value={form.correctAnswer} onChange={(e) => set("correctAnswer", e.target.value)} placeholder="Correct answer..." />
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Points</label>
              <Input type="number" value={form.points} onChange={(e) => set("points", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Difficulty</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Add Question"}</Button>
        </div>
      </div>
    </div>
  );
}

export default function LecturerExamsPage() {
  const [showExamForm, setShowExamForm] = useState(false);
  const [showQForm, setShowQForm] = useState<number | null>(null);
  const [viewing, setViewing] = useState<any | null>(null);
  const qc = useQueryClient();

  const { data: exams = [], isLoading } = useQuery<any[]>({ queryKey: ["exams"], queryFn: () => api.get("/exams") });
  const { data: courses = [] } = useQuery<any[]>({ queryKey: ["courses"], queryFn: () => api.get("/courses") });
  const { data: examQuestions = [] } = useQuery<any[]>({
    queryKey: ["exam-questions", viewing?.id],
    queryFn: () => api.get(`/exams/${viewing.id}/questions`),
    enabled: !!viewing,
  });

  const deleteExam = async (id: number) => {
    if (!confirm("Delete this exam?")) return;
    await api.del(`/exams/${id}`);
    qc.invalidateQueries({ queryKey: ["exams"] });
  };

  const publishExam = async (id: number, status: string) => {
    await api.put(`/exams/${id}`, { status });
    qc.invalidateQueries({ queryKey: ["exams"] });
  };

  const statusColor: Record<string, "default" | "secondary" | "outline"> = { active: "default", draft: "secondary", ended: "outline" };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Exams & Questions</h1>
            <p className="text-muted-foreground mt-1">Create exams and build your question bank.</p>
          </div>
          <Button onClick={() => setShowExamForm(true)}><Plus className="h-4 w-4 mr-2" /> Create Exam</Button>
        </div>

        {viewing ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setViewing(null)}>← Back</Button>
              <h2 className="text-xl font-semibold">{viewing.title} — Questions ({examQuestions.length})</h2>
              <Button size="sm" onClick={() => setShowQForm(viewing.id)}><Plus className="h-3.5 w-3.5 mr-1" /> Add Question</Button>
            </div>
            {examQuestions.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No questions yet. Add some questions to this exam.</CardContent></Card>
            ) : (
              <div className="space-y-3">
                {examQuestions.map((q: any, i: number) => (
                  <Card key={q.id}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-3">
                        <span className="text-muted-foreground text-sm font-mono w-6 shrink-0">{i + 1}.</span>
                        <div className="flex-1">
                          <p className="text-sm">{q.text}</p>
                          {q.options && <p className="text-xs text-muted-foreground mt-1">Options: {q.options.join(", ")}</p>}
                          {q.correctAnswer && <p className="text-xs text-green-700 mt-0.5">Answer: {q.correctAnswer}</p>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline">{q.type.replace("_", " ")}</Badge>
                          <span className="text-xs text-muted-foreground">{q.points}pt</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => <Card key={i} className="h-40 animate-pulse bg-muted" />)}
          </div>
        ) : exams.length === 0 ? (
          <Card>
            <CardContent className="py-12 flex flex-col items-center gap-2 text-muted-foreground">
              <FileText className="h-8 w-8 opacity-40" />
              <p className="text-sm">No exams yet. Create your first exam.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {exams.map((exam: any) => (
              <Card key={exam.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{exam.title}</CardTitle>
                    <Badge variant={statusColor[exam.status] ?? "secondary"}>{exam.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{exam.courseName}</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-3">
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div><span className="font-medium text-foreground">{exam.durationMinutes}</span> min</div>
                    <div><span className="font-medium text-foreground">{exam.questionCount}</span> Qs</div>
                    <div><span className="font-medium text-foreground">{exam.attemptCount}</span> attempts</div>
                  </div>
                  <div className="flex gap-2 flex-wrap mt-auto">
                    <Button size="sm" variant="outline" onClick={() => setViewing(exam)}>View Questions</Button>
                    {exam.status === "draft" && <Button size="sm" variant="outline" onClick={() => publishExam(exam.id, "active")}>Publish</Button>}
                    {exam.status === "active" && <Button size="sm" variant="outline" onClick={() => publishExam(exam.id, "ended")}>End</Button>}
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteExam(exam.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showExamForm && <ExamForm courses={courses} onClose={() => setShowExamForm(false)} onSave={() => qc.invalidateQueries({ queryKey: ["exams"] })} />}
      {showQForm !== null && (
        <QuestionForm
          examId={showQForm}
          onClose={() => setShowQForm(null)}
          onSave={() => { qc.invalidateQueries({ queryKey: ["exam-questions", showQForm] }); }}
        />
      )}
    </DashboardLayout>
  );
}
