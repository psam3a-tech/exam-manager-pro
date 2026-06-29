import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function StudentDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="text-muted-foreground mt-2">View enrolled courses and take exams.</p>
        </div>
        <div className="bg-card border rounded-lg p-8 text-center text-muted-foreground">
          Student features coming soon.
        </div>
      </div>
    </DashboardLayout>
  );
}
