import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import DashboardRouter from "@/pages/dashboard";
import SuperAdminDashboard from "@/pages/super-admin";
import AdminDashboard from "@/pages/admin";
import LecturerDashboard from "@/pages/lecturer";
import StudentDashboard from "@/pages/student";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, allowedRoles }: { component: React.ComponentType, allowedRoles?: string[] }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [_, setLocation] = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
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
      <h1 className="text-4xl font-bold mb-4">Unauthorized Access</h1>
      <p className="text-muted-foreground mb-8">You do not have permission to view this page.</p>
      <button 
        onClick={() => setLocation("/dashboard")}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium"
      >
        Return to Dashboard
      </button>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={DashboardRouter} />
      <Route path="/dashboard" component={DashboardRouter} />
      
      <Route path="/unauthorized" component={Unauthorized} />
      
      <Route path="/super-admin">
        {() => <ProtectedRoute component={SuperAdminDashboard} allowedRoles={["super_admin"]} />}
      </Route>
      
      <Route path="/admin">
        {() => <ProtectedRoute component={AdminDashboard} allowedRoles={["admin"]} />}
      </Route>
      
      <Route path="/lecturer">
        {() => <ProtectedRoute component={LecturerDashboard} allowedRoles={["lecturer"]} />}
      </Route>
      
      <Route path="/student">
        {() => <ProtectedRoute component={StudentDashboard} allowedRoles={["student"]} />}
      </Route>

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
