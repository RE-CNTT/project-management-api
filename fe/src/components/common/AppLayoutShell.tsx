"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { AuthProvider } from "@/features/auth/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";

export function AppLayoutShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <ToastProvider>
      <AuthProvider>
        {isLoginPage ? (
          <main className="login-layout-wrapper">{children}</main>
        ) : (
          <div className="app-shell">
            <AppSidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
            <div className="app-main-wrapper">
              <AppHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
              <main className="app-page-content">{children}</main>
            </div>
          </div>
        )}
      </AuthProvider>
    </ToastProvider>
  );
}
