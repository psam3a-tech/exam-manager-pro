import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { 
  Building2, 
  BookOpen, 
  Users, 
  LayoutDashboard, 
  FileText, 
  GraduationCap, 
  Database,
  LogOut,
  Activity,
  ClipboardList
} from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  if (!user) return null;

  const roleNav = {
    super_admin: [
      { name: "Overview", href: "/super-admin", icon: Activity },
    ],
    admin: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
    lecturer: [
      { name: "Dashboard", href: "/lecturer", icon: LayoutDashboard },
    ],
    student: [
      { name: "Dashboard", href: "/student", icon: LayoutDashboard },
    ],
  };

  const navItems = roleNav[user.role as keyof typeof roleNav] || [];

  return (
    <div className="min-h-[100dvh] flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border hidden md:flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2 text-sidebar-primary font-bold text-xl tracking-tight">
            <GraduationCap className="h-6 w-6" />
            <span>OEMS</span>
          </div>
          <p className="text-xs text-sidebar-foreground/60 mt-1 uppercase tracking-wider font-semibold">
            {user.role.replace("_", " ")} Portal
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium
                ${location.startsWith(item.href) 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"}`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center font-bold text-sidebar-primary text-xs">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              setLocation("/login");
            }}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="h-14 border-b bg-card flex items-center justify-between px-4 md:hidden">
          <div className="flex items-center gap-2 text-primary font-bold">
            <GraduationCap className="h-5 w-5" />
            <span>OEMS</span>
          </div>
          <button
            onClick={() => {
              logout();
              setLocation("/login");
            }}
            className="p-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
