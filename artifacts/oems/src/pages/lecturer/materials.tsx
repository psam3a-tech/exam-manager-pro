import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { BookOpen, ExternalLink, FileText, Link2, Music, Plus, Trash2, Video } from "lucide-react";
import { useState } from "react";

const TYPES = ["video", "pdf", "link", "slide", "document", "audio"] as const;

const typeIcon: Record<string, React.ReactNode> = {
  video: <Video className="h-4 w-4" />,
  pdf: <FileText className="h-4 w-4" />,
  link: <Link2 className="h-4 w-4" />,
  slide: <FileText className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  audio: <Music className="h-4 w-4" />,
};

function MaterialForm({ courses, onClose, onSave }: { courses: any[]; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ courseId: "", title: "", description: "", type: "link", url: "" });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.courseId || !form.title || !form.url) { alert("Fill all required fields"); return; }
    setSaving(true);
    try {
      await api.post("/materials", { ...form, courseId: Number(form.courseId) });
      onSave(); onClose();
    } catch (e: any) { alert(e.message); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border p-6 w-full max-w-md space-y-4">
        <h2 className="text-lg font-bold">Add Course Material</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Course *</label>
            <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.courseId} onChange={(e) => set("courseId", e.target.value)}>
              <option value="">Select course...</option>
              {courses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Type *</label>
            <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.type} onChange={(e) => set("type", e.target.value)}>
              {TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Title *</label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Material title..." />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">URL *</label>
            <Input value={form.url} onChange={(e) => set("url", e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Description</label>
            <textarea className="w-full border rounded-md px-3 py-2 text-sm min-h-[70px]" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Brief description..." />
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Add Material"}</Button>
        </div>
      </div>
    </div>
  );
}

export default function LecturerMaterialsPage() {
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();

  const { data: materials = [], isLoading } = useQuery<any[]>({ queryKey: ["materials"], queryFn: () => api.get("/materials") });
  const { data: courses = [] } = useQuery<any[]>({ queryKey: ["courses"], queryFn: () => api.get("/courses") });

  const deleteMaterial = async (id: number) => {
    if (!confirm("Delete this material?")) return;
    await api.del(`/materials/${id}`);
    qc.invalidateQueries({ queryKey: ["materials"] });
  };

  const byCourse = materials.reduce((acc: Record<string, any[]>, m: any) => {
    const key = m.courseName ?? "Unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Course Materials</h1>
            <p className="text-muted-foreground mt-1">Upload and manage learning materials for your courses.</p>
          </div>
          <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" /> Add Material</Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => <Card key={i} className="h-32 animate-pulse bg-muted" />)}
          </div>
        ) : materials.length === 0 ? (
          <Card>
            <CardContent className="py-12 flex flex-col items-center gap-2 text-muted-foreground">
              <BookOpen className="h-8 w-8 opacity-40" />
              <p className="text-sm">No materials yet. Add your first resource.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(byCourse).map(([course, mats]) => (
              <div key={course}>
                <h2 className="text-base font-semibold mb-3">{course}</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {(mats as any[]).map((m: any) => (
                    <Card key={m.id} className="flex flex-col">
                      <CardHeader className="pb-2">
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 rounded bg-muted shrink-0">{typeIcon[m.type] ?? <FileText className="h-4 w-4" />}</div>
                          <CardTitle className="text-sm leading-snug">{m.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col gap-2">
                        {m.description && <p className="text-xs text-muted-foreground">{m.description}</p>}
                        <div className="flex gap-2 mt-auto">
                          <Button asChild size="sm" variant="outline" className="flex-1 text-xs">
                            <a href={m.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3 mr-1" /> Open</a>
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive shrink-0" onClick={() => deleteMaterial(m.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && <MaterialForm courses={courses} onClose={() => setShowForm(false)} onSave={() => qc.invalidateQueries({ queryKey: ["materials"] })} />}
    </DashboardLayout>
  );
}
