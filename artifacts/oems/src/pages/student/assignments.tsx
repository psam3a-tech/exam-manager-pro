import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { CheckCircle, ClipboardList, Clock } from "lucide-react";
import { useState } from "react";

function SubmitModal({ assignment, onClose }: { assignment: any; onClose: () => void }) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const qc = useQueryClient();

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post(`/assignments/${assignment.id}/submit`, { content });
      qc.invalidateQueries({ queryKey: ["assignments-subs"] });
      onClose();
    } catch (e: any) { alert(e.message); }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border p-6 w-full max-w-lg space-y-4">
        <h2 className="text-lg font-bold">{assignment.title}</h2>
        {assignment.description && <p className="text-sm text-muted-foreground">{assignment.description}</p>}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Your Answer</label>
          <textarea
            className="w-full border rounded-md p-3 text-sm min-h-[160px] resize-y"
            placeholder="Write your answer here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting || !content.trim()}>
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function StudentAssignmentsPage() {
  const [submitting, setSubmitting] = useState<any | null>(null);

  const { data: assignments = [], isLoading } = useQuery<any[]>({
    queryKey: ["assignments"],
    queryFn: () => api.get("/assignments"),
  });

  const { data: subs = [] } = useQuery<any[]>({
    queryKey: ["assignments-subs"],
    queryFn: async () => {
      const active = assignments.filter((a: any) => a.status === "active");
      if (active.length === 0) return [];
      const results = await Promise.allSettled(active.map((a: any) => api.get(`/assignments/${a.id}/my-submission`)));
      return results.map((r, i) => ({ assignmentId: active[i].id, sub: r.status === "fulfilled" ? r.value : null }));
    },
    enabled: assignments.length > 0,
  });

  const getSubmission = (assignmentId: number) => subs.find((s: any) => s.assignmentId === assignmentId)?.sub;

  const isOverdue = (a: any) => a.dueDate && new Date(a.dueDate) < new Date();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground mt-1">View and submit your course assignments.</p>
        </div>

        {isLoading ? (
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
            {assignments.map((a: any) => {
              const sub = getSubmission(a.id);
              const overdue = isOverdue(a);
              return (
                <Card key={a.id} className={overdue && !sub ? "border-red-300" : ""}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-base">{a.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{a.courseName} · {a.lecturerName}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge variant={a.status === "active" ? "default" : "secondary"}>{a.status}</Badge>
                        {sub && <Badge variant="outline" className="border-green-500 text-green-700">Submitted</Badge>}
                        {overdue && !sub && <Badge variant="destructive">Overdue</Badge>}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {a.description && <p className="text-sm">{a.description}</p>}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{a.totalPoints} pts</span>
                      {a.dueDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Due {new Date(a.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {sub ? (
                      <div className="bg-muted/40 rounded-md p-3 text-sm">
                        <p className="font-medium mb-1">Your submission</p>
                        <p className="text-muted-foreground whitespace-pre-wrap line-clamp-3">{sub.content}</p>
                        {sub.grade !== null && (
                          <p className="mt-2 font-medium text-green-700">Grade: {sub.grade}/{a.totalPoints}</p>
                        )}
                        {sub.feedback && <p className="text-xs text-muted-foreground mt-1">Feedback: {sub.feedback}</p>}
                      </div>
                    ) : a.status === "active" && !overdue ? (
                      <Button size="sm" onClick={() => setSubmitting(a)}>Submit Assignment</Button>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {submitting && <SubmitModal assignment={submitting} onClose={() => setSubmitting(null)} />}
    </DashboardLayout>
  );
}
