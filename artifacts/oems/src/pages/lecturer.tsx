import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function LecturerDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lecturer Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage courses, exams, and question bank.</p>
        </div>
        <div className="bg-card border rounded-lg p-8 text-center text-muted-foreground">
          Lecturer features coming soon.
        </div>
      </div>
    </DashboardLayout>
  );
}
