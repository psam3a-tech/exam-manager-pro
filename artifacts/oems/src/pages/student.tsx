import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { BookOpen, ClipboardList, FileText, Megaphone, Video } from "lucide-react";
import { Link } from "wouter";

export default function StudentDashboard() {
  const { user } = useAuth();

  const { data: exams = [] } = useQuery<any[]>({ queryKey: ["exams"], queryFn: () => api.get("/exams?status=active") });
  const { data: liveSessions = [] } = useQuery<any[]>({ queryKey: ["live-sessions"], queryFn: () => api.get("/live-sessions") });
  const { data: materials = [] } = useQuery<any[]>({ queryKey: ["materials"], queryFn: () => api.get("/materials") });
  const { data: assignments = [] } = useQuery<any[]>({ queryKey: ["assignments"], queryFn: () => api.get("/assignments") });
  const { data: announcements = [] } = useQuery<any[]>({ queryKey: ["announcements"], queryFn: () => api.get("/announcements") });

  const upcomingLive = liveSessions.filter((s: any) => s.status === "scheduled" || s.status === "live").slice(0, 3);
  const recentAnn = announcements.slice(0, 3);
  const pendingAssignments = assignments.filter((a: any) => a.status === "active").slice(0, 3);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name?.split(" ")[0]}</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening in your courses.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Exams</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{exams.length}</div>
              <Link href="/student/exams" className="text-xs text-primary hover:underline">View exams →</Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Live Sessions</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveSessions.filter((s: any) => s.status === "live").length}</div>
              <Link href="/student/live" className="text-xs text-primary hover:underline">View classes →</Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Course Materials</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{materials.length}</div>
              <Link href="/student/materials" className="text-xs text-primary hover:underline">Browse materials →</Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingAssignments.length}</div>
              <Link href="/student/assignments" className="text-xs text-primary hover:underline">View assignments →</Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Video className="h-4 w-4" /> Upcoming Live Classes</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingLive.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming sessions.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingLive.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{s.title}</p>
                        <p className="text-xs text-muted-foreground">{s.courseName} · {new Date(s.scheduledAt).toLocaleString()}</p>
                      </div>
                      <Badge variant={s.status === "live" ? "default" : "secondary"}>{s.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Megaphone className="h-4 w-4" /> Recent Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              {recentAnn.length === 0 ? (
                <p className="text-sm text-muted-foreground">No announcements.</p>
              ) : (
                <div className="space-y-3">
                  {recentAnn.map((a: any) => (
                    <div key={a.id}>
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.courseName ?? "Global"} · {a.authorName}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
