import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardRouter() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [_, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated || !user) {
      setLocation("/login");
      return;
    }

    switch (user.role) {
      case "super_admin":
        setLocation("/super-admin");
        break;
      case "admin":
        setLocation("/admin");
        break;
      case "lecturer":
        setLocation("/lecturer");
        break;
      case "student":
        setLocation("/student");
        break;
      default:
        setLocation("/unauthorized");
    }
  }, [user, isLoading, isAuthenticated, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-medium">Redirecting to your portal...</p>
      </div>
    </div>
  );
}
