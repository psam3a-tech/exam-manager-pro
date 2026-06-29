import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Megaphone } from "lucide-react";

export default function StudentAnnouncementsPage() {
  const { data: announcements = [], isLoading } = useQuery<any[]>({
    queryKey: ["announcements"],
    queryFn: () => api.get("/announcements"),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground mt-1">Stay updated with course and platform announcements.</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Card key={i} className="h-24 animate-pulse bg-muted" />)}
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
                    <CardTitle className="text-base">{a.title}</CardTitle>
                    <Badge variant="outline" className="shrink-0">
                      {a.courseName ?? "Global"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    By {a.authorName} · {new Date(a.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{a.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
