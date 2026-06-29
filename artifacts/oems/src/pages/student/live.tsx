import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { ExternalLink, Video } from "lucide-react";

export default function StudentLivePage() {
  const { data: sessions = [], isLoading } = useQuery<any[]>({
    queryKey: ["live-sessions"],
    queryFn: () => api.get("/live-sessions"),
    refetchInterval: 30000,
  });

  const live = sessions.filter((s: any) => s.status === "live");
  const scheduled = sessions.filter((s: any) => s.status === "scheduled");
  const ended = sessions.filter((s: any) => s.status === "ended" && s.recordingUrl);

  const statusColor: Record<string, "default" | "secondary" | "outline"> = {
    live: "default",
    scheduled: "secondary",
    ended: "outline",
    cancelled: "outline",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Classes</h1>
          <p className="text-muted-foreground mt-1">Join live sessions and access recordings.</p>
        </div>

        {live.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live Now
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {live.map((s: any) => (
                <Card key={s.id} className="border-green-500/40 bg-green-50/30 dark:bg-green-950/10">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{s.title}</CardTitle>
                      <Badge variant="default" className="bg-green-600">LIVE</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{s.courseName} · {s.lecturerName}</p>
                  </CardHeader>
                  <CardContent>
                    {s.description && <p className="text-sm mb-3">{s.description}</p>}
                    <p className="text-xs text-muted-foreground mb-3">Duration: {s.durationMinutes} min</p>
                    {s.meetingUrl && (
                      <Button asChild size="sm" className="w-full">
                        <a href={s.meetingUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" /> Join Session
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold mb-3">Upcoming Sessions</h2>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map((i) => <Card key={i} className="h-32 animate-pulse bg-muted" />)}
            </div>
          ) : scheduled.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">No upcoming sessions scheduled.</CardContent></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {scheduled.map((s: any) => (
                <Card key={s.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{s.title}</CardTitle>
                      <Badge variant="secondary">Scheduled</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{s.courseName} · {s.lecturerName}</p>
                  </CardHeader>
                  <CardContent>
                    {s.description && <p className="text-sm mb-2">{s.description}</p>}
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.scheduledAt).toLocaleString()} · {s.durationMinutes} min
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {ended.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Recordings</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {ended.map((s: any) => (
                <Card key={s.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{s.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{s.courseName} · {new Date(s.scheduledAt).toLocaleDateString()}</p>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="outline" size="sm">
                      <a href={s.recordingUrl} target="_blank" rel="noopener noreferrer">
                        <Video className="h-4 w-4 mr-2" /> Watch Recording
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
