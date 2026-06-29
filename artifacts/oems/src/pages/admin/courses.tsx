import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { BookOpen, Plus } from "lucide-react";
import { useState } from "react";

function CourseForm({ departments, onClose, onSave }: { departments: any[]; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ name: "", code: "", description: "", departmentId: "", credits: "3" });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.code) { alert("Name and code are required"); return; }
    setSaving(true);
    try {
      await api.post("/courses", { ...form, departmentId: form.departmentId ? Number(form.departmentId) : null, credits: Number(form.credits) });
      onSave(); onClose();
    } catch (e: any) { alert(e.message); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border p-6 w-full max-w-md space-y-4">
        <h2 className="text-lg font-bold">Create Course</h2>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Name *</label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Data Structures" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Code *</label>
              <Input value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="e.g. CS201" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Description</label>
            <textarea className="w-full border rounded-md px-3 py-2 text-sm min-h-[70px]" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Course description..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Department</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.departmentId} onChange={(e) => set("departmentId", e.target.value)}>
                <option value="">None</option>
                {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Credits</label>
              <Input type="number" value={form.credits} onChange={(e) => set("credits", e.target.value)} />
            </div>
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

export default function AdminCoursesPage() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  const { data: courses = [], isLoading } = useQuery<any[]>({ queryKey: ["courses"], queryFn: () => api.get("/courses") });
  const { data: departments = [] } = useQuery<any[]>({ queryKey: ["departments"], queryFn: () => api.get("/departments") });

  const filtered = courses.filter((c: any) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
            <p className="text-muted-foreground mt-1">Manage all courses on the platform.</p>
          </div>
          <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" /> Create Course</Button>
        </div>

        <Input placeholder="Search by name or code..." className="max-w-xs" value={search} onChange={(e) => setSearch(e.target.value)} />

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <Card key={i} className="h-36 animate-pulse bg-muted" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 flex flex-col items-center gap-2 text-muted-foreground">
              <BookOpen className="h-8 w-8 opacity-40" />
              <p className="text-sm">No courses found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c: any) => (
              <Card key={c.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{c.name}</CardTitle>
                      <p className="text-xs font-mono text-muted-foreground">{c.code}</p>
                    </div>
                    <Badge variant="outline">{c.credits} cr</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
                  <p className="text-xs text-muted-foreground">{c.departmentName ?? "No department"}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showForm && <CourseForm departments={departments} onClose={() => setShowForm(false)} onSave={() => qc.invalidateQueries({ queryKey: ["courses"] })} />}
    </DashboardLayout>
  );
}
