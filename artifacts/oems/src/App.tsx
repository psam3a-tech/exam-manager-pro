import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import DashboardRouter from "@/pages/dashboard";

import SuperAdminDashboard from "@/pages/super-admin";

import AdminDashboard from "@/pages/admin";
import AdminUsersPage from "@/pages/admin/users";
import AdminCoursesPage from "@/pages/admin/courses";
import AdminAnnouncementsPage from "@/pages/admin/announcements";
import AdminProfilePage from "@/pages/admin/profile";

import LecturerDashboard from "@/pages/lecturer";
import LecturerExamsPage from "@/pages/lecturer/exams";
import LecturerLivePage from "@/pages/lecturer/live";
import LecturerMaterialsPage from "@/pages/lecturer/materials";
import LecturerAssignmentsPage from "@/pages/lecturer/assignments";
import LecturerProctoringPage from "@/pages/lecturer/proctoring";
import LecturerProfilePage from "@/pages/lecturer/profile";

import StudentDashboard from "@/pages/student";
import StudentExamsPage from "@/pages/student/exams";
import StudentLivePage from "@/pages/student/live";
import StudentMaterialsPage from "@/pages/student/materials";
import StudentAssignmentsPage from "@/pages/student/assignments";
import StudentAnnouncementsPage from "@/pages/student/announcements";
import StudentProfilePage from "@/pages/student/profile";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function ProtectedRoute({ component: Component, allowedRoles }: { component: React.ComponentType; allowedRoles?: string[] }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [_, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    setLocation("/unauthorized");
    return null;
  }

  return <Component />;
}

function Unauthorized() {
  const [_, setLocation] = useLocation();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold mb-4">Unauthorized</h1>
      <p className="text-muted-foreground mb-8">You don't have permission to view this page.</p>
      <button onClick={() => setLocation("/dashboard")} className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium">
        Return to Dashboard
      </button>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/" component={DashboardRouter} />
      <Route path="/dashboard" component={DashboardRouter} />
      <Route path="/unauthorized" component={Unauthorized} />

      {/* Super Admin */}
      <Route path="/super-admin">{() => <ProtectedRoute component={SuperAdminDashboard} allowedRoles={["super_admin"]} />}</Route>

      {/* Admin */}
      <Route path="/admin">{() => <ProtectedRoute component={AdminDashboard} allowedRoles={["admin", "super_admin"]} />}</Route>
      <Route path="/admin/users">{() => <ProtectedRoute component={AdminUsersPage} allowedRoles={["admin", "super_admin"]} />}</Route>
      <Route path="/admin/courses">{() => <ProtectedRoute component={AdminCoursesPage} allowedRoles={["admin", "super_admin"]} />}</Route>
      <Route path="/admin/announcements">{() => <ProtectedRoute component={AdminAnnouncementsPage} allowedRoles={["admin", "super_admin"]} />}</Route>
      <Route path="/admin/profile">{() => <ProtectedRoute component={AdminProfilePage} allowedRoles={["admin", "super_admin"]} />}</Route>

      {/* Lecturer */}
      <Route path="/lecturer">{() => <ProtectedRoute component={LecturerDashboard} allowedRoles={["lecturer"]} />}</Route>
      <Route path="/lecturer/exams">{() => <ProtectedRoute component={LecturerExamsPage} allowedRoles={["lecturer"]} />}</Route>
      <Route path="/lecturer/live">{() => <ProtectedRoute component={LecturerLivePage} allowedRoles={["lecturer"]} />}</Route>
      <Route path="/lecturer/materials">{() => <ProtectedRoute component={LecturerMaterialsPage} allowedRoles={["lecturer"]} />}</Route>
      <Route path="/lecturer/assignments">{() => <ProtectedRoute component={LecturerAssignmentsPage} allowedRoles={["lecturer"]} />}</Route>
      <Route path="/lecturer/proctoring">{() => <ProtectedRoute component={LecturerProctoringPage} allowedRoles={["lecturer"]} />}</Route>
      <Route path="/lecturer/profile">{() => <ProtectedRoute component={LecturerProfilePage} allowedRoles={["lecturer"]} />}</Route>

      {/* Student */}
      <Route path="/student">{() => <ProtectedRoute component={StudentDashboard} allowedRoles={["student"]} />}</Route>
      <Route path="/student/exams">{() => <ProtectedRoute component={StudentExamsPage} allowedRoles={["student"]} />}</Route>
      <Route path="/student/live">{() => <ProtectedRoute component={StudentLivePage} allowedRoles={["student"]} />}</Route>
      <Route path="/student/materials">{() => <ProtectedRoute component={StudentMaterialsPage} allowedRoles={["student"]} />}</Route>
      <Route path="/student/assignments">{() => <ProtectedRoute component={StudentAssignmentsPage} allowedRoles={["student"]} />}</Route>
      <Route path="/student/announcements">{() => <ProtectedRoute component={StudentAnnouncementsPage} allowedRoles={["student"]} />}</Route>
      <Route path="/student/profile">{() => <ProtectedRoute component={StudentProfilePage} allowedRoles={["student"]} />}</Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
