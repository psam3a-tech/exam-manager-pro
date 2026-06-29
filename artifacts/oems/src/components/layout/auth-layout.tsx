import { ReactNode } from "react";
import { GraduationCap } from "lucide-react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] w-full flex">
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-background">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex items-center gap-2 text-primary mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight">OEMS</span>
          </div>
          {children}
        </div>
      </div>
      <div className="hidden lg:block relative w-0 flex-1 bg-sidebar">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-sidebar-foreground">
          <div className="max-w-2xl text-center space-y-6">
            <h2 className="text-4xl font-bold tracking-tight text-white">Online Examination Management System</h2>
            <p className="text-lg text-sidebar-foreground/80 leading-relaxed">
              A precise, authoritative platform for university staff and students.
              Securely manage institutions, construct diverse examinations, and track academic progress.
            </p>
          </div>
        </div>
        {/* Subtle decorative pattern */}
        <div className="absolute inset-0 opacity-10" 
             style={{ 
               backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,1) 1px, transparent 0)',
               backgroundSize: '40px 40px' 
             }}>
        </div>
      </div>
    </div>
  );
}
