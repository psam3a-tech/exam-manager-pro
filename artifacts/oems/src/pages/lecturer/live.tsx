import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { ExternalLink, Plus, Trash2, Video } from "lucide-react";
import { useState } from "react";

function SessionForm({ courses, onClose, onSave }: { courses: any[]; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ courseId: "", title: "", description: "", scheduledAt: "", durationMinutes: "60", meetingUrl: "", status: "scheduled" });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.courseId || !form.title || !form.scheduledAt) { alert("Fill required fields"); return; }
    setSaving(true);
    try {
      await api.post("/live-sessions", { ...form, courseId: Number(form.courseId), durationMinutes: Number(form.durationMinutes) });
      onSave();
      onClose();
    } catch (e: any) { alert(e.message); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border p-6 w-full max-w-md space-y-4">
        <h2 className="text-lg font-bold">Schedule Live Session</h2>
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
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Session title..." />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Description</label>
            <textarea className="w-full border rounded-md px-3 py-2 text-sm min-h-[80px]" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What will you cover?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Date & Time *</label>
              <Input type="datetime-local" value={form.scheduledAt} onChange={(e) => set("scheduledAt", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Duration (min)</label>
              <Input type="number" value={form.durationMinutes} onChange={(e) => set("durationMinutes", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Meeting URL</label>
            <Input value={form.meetingUrl} onChange={(e) => set("meetingUrl", e.target.value)} placeholder="https://meet.google.com/..." />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Status</label>
            <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="scheduled">Scheduled</option>
              <option value="live">Live</option>
              <option value="ended">Ended</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Schedule"}</Button>
        </div>
      </div>
    </div>
  );
}

export default function LecturerLivePage() {
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery<any[]>({ queryKey: ["live-sessions"], queryFn: () => api.get("/live-sessions") });
  const { data: courses = [] } = useQuery<any[]>({ queryKey: ["courses"], queryFn: () => api.get("/courses") });

  const deleteSession = async (id: number) => {
    if (!confirm("Delete this session?")) return;
    await api.del(`/live-sessions/${id}`);
    qc.invalidateQueries({ queryKey: ["live-sessions"] });
  };

  const updateStatus = async (id: number, status: string) => {
    await api.put(`/live-sessions/${id}`, { status });
    qc.invalidateQueries({ queryKey: ["live-sessions"] });
  };

  const statusColor: Record<string, "default" | "secondary" | "outline"> = { live: "default", scheduled: "secondary", ended: "outline", cancelled: "outline" };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Live Classes</h1>
            <p className="text-muted-foreground mt-1">Schedule and manage online class sessions.</p>
          </div>
          <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" /> Schedule Session</Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => <Card key={i} className="h-40 animate-pulse bg-muted" />)}
          </div>
        ) : sessions.length === 0 ? (
          <Card>
            <CardContent className="py-12 flex flex-col items-center gap-2 text-muted-foreground">
              <Video className="h-8 w-8 opacity-40" />
              <p className="text-sm">No sessions yet. Schedule your first live class.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sessions.map((s: any) => (
              <Card key={s.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{s.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{s.courseName}</p>
                    </div>
                    <Badge variant={statusColor[s.status] ?? "secondary"}>{s.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {s.description && <p className="text-sm text-muted-foreground">{s.description}</p>}
                  <p className="text-xs text-muted-foreground">{new Date(s.scheduledAt).toLocaleString()} · {s.durationMinutes} min</p>
                  {s.meetingUrl && (
                    <a href={s.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" /> {s.meetingUrl}
                    </a>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    {s.status === "scheduled" && <Button size="sm" variant="outline" onClick={() => updateStatus(s.id, "live")}>Go Live</Button>}
                    {s.status === "live" && <Button size="sm" variant="outline" onClick={() => updateStatus(s.id, "ended")}>End Session</Button>}
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteSession(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showForm && <SessionForm courses={courses} onClose={() => setShowForm(false)} onSave={() => qc.invalidateQueries({ queryKey: ["live-sessions"] })} />}
    </DashboardLayout>
  );
}
