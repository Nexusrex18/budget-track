// components/dashboard-layout.tsx
import { Navbar } from "./navbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col pl-10">
      <Navbar />
      <main className="flex-1 container py-6 px-4 sm:px-6 lg:px-8">{children}</main>
      <footer className="border-t py-4">
        <div className="container text-center text-sm text-muted-foreground">
          FinTrack - Personal Finance Visualizer
        </div>
      </footer>
    </div>
  );
}