import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage users, departments, courses, and classes.</p>
        </div>
        <div className="bg-card border rounded-lg p-8 text-center text-muted-foreground">
          Admin features coming soon.
        </div>
      </div>
    </DashboardLayout>
  );
}
