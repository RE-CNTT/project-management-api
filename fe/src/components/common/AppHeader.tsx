"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  ChevronRight,
  Activity,
  Server,
  User as UserIcon,
} from "lucide-react";
import { healthCheck } from "@/features/users/api";
import { useAuth } from "@/features/auth/AuthContext";
import { Badge } from "@/components/ui/Status";

interface AppHeaderProps {
  onToggleSidebar: () => void;
}

export function AppHeader({ onToggleSidebar }: AppHeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [backendHealth, setBackendHealth] = useState<"online" | "offline" | "checking">("checking");

  useEffect(() => {
    let isMounted = true;

    async function verifyHealth() {
      try {
        const res = await healthCheck();
        if (isMounted) {
          setBackendHealth(res.status === "success" ? "online" : "offline");
        }
      } catch {
        if (isMounted) {
          setBackendHealth("offline");
        }
      }
    }

    void verifyHealth();
    const interval = setInterval(verifyHealth, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const getBreadcrumbs = () => {
    if (pathname.startsWith("/projects/")) {
      const id = pathname.split("/")[2];
      return [
        { label: "Dự án", href: "/projects" },
        { label: `Chi tiết #${id}`, href: pathname },
      ];
    }
    if (pathname.startsWith("/projects")) {
      return [{ label: "Quản lý Dự án", href: "/projects" }];
    }
    if (pathname.startsWith("/users")) {
      return [{ label: "Quản lý Người dùng", href: "/users" }];
    }
    return [{ label: "Dashboard", href: "/" }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          type="button"
          className="header-mobile-toggle"
          onClick={onToggleSidebar}
          aria-label="Mở thanh điều hướng"
        >
          <Menu size={20} />
        </button>

        <nav className="header-breadcrumbs" aria-label="Breadcrumb">
          <ol className="breadcrumb-list">
            <li className="breadcrumb-item">
              <Link href="/projects" className="breadcrumb-link">
                CMS
              </Link>
            </li>
            {breadcrumbs.map((crumb, idx) => (
              <li key={crumb.href} className="breadcrumb-item">
                <ChevronRight size={14} className="breadcrumb-separator" />
                {idx === breadcrumbs.length - 1 ? (
                  <span className="breadcrumb-current">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="breadcrumb-link">
                    {crumb.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className="header-right">
        <div className="header-status-indicator">
          {backendHealth === "online" ? (
            <Badge variant="success" size="sm" dot>
              <Activity size={12} style={{ marginRight: 4 }} /> Backend 8000 Online
            </Badge>
          ) : backendHealth === "offline" ? (
            <Badge variant="danger" size="sm" dot>
              <Server size={12} style={{ marginRight: 4 }} /> Backend Offline
            </Badge>
          ) : (
            <Badge variant="neutral" size="sm">
              Kiểm tra API...
            </Badge>
          )}
        </div>

        {user ? (
          <div className="header-user-pill">
            <div className="header-user-avatar">
              <UserIcon size={14} />
            </div>
            <span className="header-user-email">{user.email}</span>
          </div>
        ) : null}
      </div>
    </header>
  );
}
