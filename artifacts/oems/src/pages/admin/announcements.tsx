import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { Megaphone, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

function AnnouncementForm({ courses, onClose, onSave }: { courses: any[]; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ courseId: "", title: "", content: "" });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title || !form.content) { alert("Title and content required"); return; }
    setSaving(true);
    try {
      await api.post("/announcements", { ...form, courseId: form.courseId ? Number(form.courseId) : null });
      onSave(); onClose();
    } catch (e: any) { alert(e.message); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border p-6 w-full max-w-lg space-y-4">
        <h2 className="text-lg font-bold">Post Announcement</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Target (leave blank for global)</label>
            <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.courseId} onChange={(e) => set("courseId", e.target.value)}>
              <option value="">Global — All users</option>
              {courses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Title *</label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Announcement title..." />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Content *</label>
            <textarea
              className="w-full border rounded-md px-3 py-2 text-sm min-h-[120px]"
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder="Write your announcement..."
            />
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Posting..." : "Post"}</Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminAnnouncementsPage() {
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();

  const { data: announcements = [], isLoading } = useQuery<any[]>({
    queryKey: ["announcements"],
    queryFn: () => api.get("/announcements"),
  });
  const { data: courses = [] } = useQuery<any[]>({ queryKey: ["courses"], queryFn: () => api.get("/courses") });

  const deleteAnnouncement = async (id: number) => {
    if (!confirm("Delete this announcement?")) return;
    await api.del(`/announcements/${id}`);
    qc.invalidateQueries({ queryKey: ["announcements"] });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
            <p className="text-muted-foreground mt-1">Post announcements to students and staff.</p>
          </div>
          <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" /> Post Announcement</Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <Card key={i} className="h-32 animate-pulse bg-muted" />)}
          </div>
        ) : announcements.length === 0 ? (
          <Card>
            <CardContent className="py-12 flex flex-col items-center gap-2 text-muted-foreground">
              <Megaphone className="h-8 w-8 opacity-40" />
              <p className="text-sm">No announcements yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {announcements.map((a: any) => (
              <Card key={a.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-base">{a.title}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        By {a.authorName} · {new Date(a.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline">{a.courseName ?? "Global"}</Badge>
                      <Button size="sm" variant="ghost" className="text-destructive h-8 w-8 p-0" onClick={() => deleteAnnouncement(a.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{a.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showForm && <AnnouncementForm courses={courses} onClose={() => setShowForm(false)} onSave={() => qc.invalidateQueries({ queryKey: ["announcements"] })} />}
    </DashboardLayout>
  );
}
