import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { CheckCircle, ClipboardList, Clock, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

function AssignmentForm({ courses, onClose, onSave }: { courses: any[]; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ courseId: "", title: "", description: "", dueDate: "", totalPoints: "100", status: "draft" });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.courseId || !form.title) { alert("Fill required fields"); return; }
    setSaving(true);
    try {
      await api.post("/assignments", { ...form, courseId: Number(form.courseId), totalPoints: Number(form.totalPoints), dueDate: form.dueDate || null });
      onSave(); onClose();
    } catch (e: any) { alert(e.message); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border p-6 w-full max-w-md space-y-4">
        <h2 className="text-lg font-bold">Create Assignment</h2>
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
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Assignment title..." />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Instructions</label>
            <textarea className="w-full border rounded-md px-3 py-2 text-sm min-h-[100px]" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe the assignment..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Due Date</label>
              <Input type="datetime-local" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Total Points</label>
              <Input type="number" value={form.totalPoints} onChange={(e) => set("totalPoints", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Status</label>
            <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="draft">Draft</option>
              <option value="active">Active (visible to students)</option>
              <option value="closed">Closed</option>
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

function GradeModal({ submission, totalPoints, onClose, onSave }: { submission: any; totalPoints: number; onClose: () => void; onSave: () => void }) {
  const [grade, setGrade] = useState(submission.grade?.toString() ?? "");
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/submissions/${submission.id}/grade`, { grade: Number(grade), feedback });
      onSave(); onClose();
    } catch (e: any) { alert(e.message); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border p-6 w-full max-w-md space-y-4">
        <h2 className="text-lg font-bold">Grade Submission</h2>
        <p className="text-sm text-muted-foreground">Student: {submission.studentName}</p>
        <div className="bg-muted/40 rounded-md p-3 text-sm max-h-32 overflow-y-auto">
          <p className="whitespace-pre-wrap">{submission.content}</p>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Grade (out of {totalPoints})</label>
          <Input type="number" min="0" max={totalPoints} value={grade} onChange={(e) => setGrade(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Feedback</label>
          <textarea className="w-full border rounded-md p-2 text-sm min-h-[80px]" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Write feedback..." />
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !grade}>{saving ? "Saving..." : "Save Grade"}</Button>
        </div>
      </div>
    </div>
  );
}

export default function LecturerAssignmentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [viewing, setViewing] = useState<any | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<{ sub: any; totalPoints: number } | null>(null);
  const qc = useQueryClient();

  const { data: assignments = [], isLoading } = useQuery<any[]>({ queryKey: ["assignments"], queryFn: () => api.get("/assignments") });
  const { data: courses = [] } = useQuery<any[]>({ queryKey: ["courses"], queryFn: () => api.get("/courses") });
  const { data: submissions = [] } = useQuery<any[]>({
    queryKey: ["submissions", viewing?.id],
    queryFn: () => api.get(`/assignments/${viewing.id}/submissions`),
    enabled: !!viewing,
  });

  const deleteAssignment = async (id: number) => {
    if (!confirm("Delete this assignment?")) return;
    await api.del(`/assignments/${id}`);
    qc.invalidateQueries({ queryKey: ["assignments"] });
  };

  const updateStatus = async (id: number, status: string) => {
    await api.put(`/assignments/${id}`, { status });
    qc.invalidateQueries({ queryKey: ["assignments"] });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
            <p className="text-muted-foreground mt-1">Create assignments and grade student submissions.</p>
          </div>
          <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" /> Create Assignment</Button>
        </div>

        {viewing ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setViewing(null)}>← Back</Button>
              <h2 className="text-xl font-semibold">{viewing.title} — Submissions</h2>
            </div>
            {submissions.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No submissions yet.</CardContent></Card>
            ) : (
              <div className="space-y-3">
                {submissions.map((s: any) => (
                  <Card key={s.id}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{s.studentName}</p>
                          <p className="text-xs text-muted-foreground mb-2">{new Date(s.submittedAt).toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2 whitespace-pre-wrap">{s.content}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          {s.grade !== null ? (
                            <Badge variant="outline" className="border-green-500 text-green-700">{s.grade}/{viewing.totalPoints}</Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                          <Button size="sm" variant="outline" onClick={() => setGradingSubmission({ sub: s, totalPoints: viewing.totalPoints })}>
                            <CheckCircle className="h-3.5 w-3.5 mr-1" /> Grade
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <Card key={i} className="h-40 animate-pulse bg-muted" />)}
          </div>
        ) : assignments.length === 0 ? (
          <Card>
            <CardContent className="py-12 flex flex-col items-center gap-2 text-muted-foreground">
              <ClipboardList className="h-8 w-8 opacity-40" />
              <p className="text-sm">No assignments yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {assignments.map((a: any) => (
              <Card key={a.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-base">{a.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{a.courseName}</p>
                    </div>
                    <Badge variant={a.status === "active" ? "default" : a.status === "closed" ? "outline" : "secondary"}>{a.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {a.description && <p className="text-sm text-muted-foreground line-clamp-2">{a.description}</p>}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{a.totalPoints} pts</span>
                    {a.dueDate && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Due {new Date(a.dueDate).toLocaleDateString()}</span>}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => setViewing(a)}>View Submissions</Button>
                    {a.status === "draft" && <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, "active")}>Publish</Button>}
                    {a.status === "active" && <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, "closed")}>Close</Button>}
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteAssignment(a.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showForm && <AssignmentForm courses={courses} onClose={() => setShowForm(false)} onSave={() => qc.invalidateQueries({ queryKey: ["assignments"] })} />}
      {gradingSubmission && (
        <GradeModal
          submission={gradingSubmission.sub}
          totalPoints={gradingSubmission.totalPoints}
          onClose={() => setGradingSubmission(null)}
          onSave={() => qc.invalidateQueries({ queryKey: ["submissions", viewing?.id] })}
        />
      )}
    </DashboardLayout>
  );
}
