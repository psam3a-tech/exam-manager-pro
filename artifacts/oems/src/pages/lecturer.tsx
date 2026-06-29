import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { ClipboardList, FileText, Shield, Video } from "lucide-react";
import { Link } from "wouter";

export default function LecturerDashboard() {
  const { user } = useAuth();
  const { data: exams = [] } = useQuery<any[]>({ queryKey: ["exams"], queryFn: () => api.get("/exams") });
  const { data: liveSessions = [] } = useQuery<any[]>({ queryKey: ["live-sessions"], queryFn: () => api.get("/live-sessions") });
  const { data: assignments = [] } = useQuery<any[]>({ queryKey: ["assignments"], queryFn: () => api.get("/assignments") });

  const activeExams = exams.filter((e: any) => e.status === "active");
  const upcomingLive = liveSessions.filter((s: any) => s.status === "scheduled" || s.status === "live").slice(0, 4);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lecturer Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your courses, exams, and learning content.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{exams.length}</div>
              <p className="text-xs text-muted-foreground">{activeExams.length} active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Live Sessions</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveSessions.length}</div>
              <Link href="/lecturer/live" className="text-xs text-primary hover:underline">Manage →</Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Assignments</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignments.length}</div>
              <Link href="/lecturer/assignments" className="text-xs text-primary hover:underline">Manage →</Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Proctoring</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeExams.length}</div>
              <Link href="/lecturer/proctoring" className="text-xs text-primary hover:underline">View reports →</Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Video className="h-4 w-4" /> Upcoming Live Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingLive.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming sessions. <Link href="/lecturer/live" className="text-primary hover:underline">Schedule one →</Link></p>
            ) : (
              <div className="space-y-3">
                {upcomingLive.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between border rounded-md p-3">
                    <div>
                      <p className="font-medium text-sm">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.courseName} · {new Date(s.scheduledAt).toLocaleString()} · {s.durationMinutes} min</p>
                    </div>
                    <Badge variant={s.status === "live" ? "default" : "secondary"}>{s.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
