import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { BookOpen, ExternalLink, FileText, Link2, Music, Video } from "lucide-react";
import { useState } from "react";

const typeIcon: Record<string, React.ReactNode> = {
  video: <Video className="h-4 w-4" />,
  pdf: <FileText className="h-4 w-4" />,
  link: <Link2 className="h-4 w-4" />,
  slide: <FileText className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  audio: <Music className="h-4 w-4" />,
};

const typeBadge: Record<string, string> = {
  video: "bg-purple-100 text-purple-700",
  pdf: "bg-red-100 text-red-700",
  link: "bg-blue-100 text-blue-700",
  slide: "bg-orange-100 text-orange-700",
  document: "bg-gray-100 text-gray-700",
  audio: "bg-green-100 text-green-700",
};

export default function StudentMaterialsPage() {
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  const { data: materials = [], isLoading } = useQuery<any[]>({
    queryKey: ["materials"],
    queryFn: () => api.get("/materials"),
  });

  const courses = Array.from(new Set(materials.map((m: any) => m.courseName))).filter(Boolean);

  const filtered = materials.filter((m: any) => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) || (m.description ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCourse = selectedCourse === "all" || m.courseName === selectedCourse;
    return matchSearch && matchCourse;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Materials</h1>
          <p className="text-muted-foreground mt-1">Access all learning materials for your enrolled courses.</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Input placeholder="Search materials..." className="max-w-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select
            className="border rounded-md px-3 py-2 text-sm bg-background"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="all">All Courses</option>
            {courses.map((c) => <option key={c as string} value={c as string}>{c as string}</option>)}
          </select>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <Card key={i} className="h-40 animate-pulse bg-muted" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 flex flex-col items-center gap-2 text-muted-foreground">
              <BookOpen className="h-8 w-8 opacity-40" />
              <p className="text-sm">No materials found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m: any) => (
              <Card key={m.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-2">
                    <div className={`p-2 rounded-md ${typeBadge[m.type] ?? "bg-muted"}`}>
                      {typeIcon[m.type] ?? <FileText className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm leading-snug">{m.title}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{m.courseName}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between gap-3">
                  {m.description && <p className="text-xs text-muted-foreground">{m.description}</p>}
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <a href={m.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5 mr-2" />
                      {m.type === "video" ? "Watch" : m.type === "pdf" || m.type === "document" ? "Open" : "View"}
                    </a>
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
