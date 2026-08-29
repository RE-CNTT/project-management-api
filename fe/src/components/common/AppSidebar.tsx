"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderKanban,
  Users,
  LogOut,
  ShieldCheck,
  UserCheck,
  X,
  Layers,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();

  const navigation = [
    {
      name: "Dự án (Projects)",
      href: "/projects",
      icon: FolderKanban,
      match: (path: string) => path.startsWith("/projects") || path === "/",
    },
    {
      name: "Người dùng (Users)",
      href: "/users",
      icon: Users,
      badge: isAdmin ? "Admin" : undefined,
      match: (path: string) => path.startsWith("/users"),
    },
  ];

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? "sidebar-overlay--visible" : ""}`}
        onClick={onClose}
      />
      <aside className={`app-sidebar ${isOpen ? "app-sidebar--open" : ""}`}>
        <div className="sidebar-brand-container">
          <div className="sidebar-brand-logo">
            <div className="sidebar-brand-icon">
              <Layers size={22} className="sidebar-brand-icon-svg" />
            </div>
            <div className="sidebar-brand-title-wrap">
              <h2 className="sidebar-brand-name">ProjectHub</h2>
              <span className="sidebar-brand-badge">CMS PRO</span>
            </div>
          </div>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Đóng menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-nav-section">
          <div className="sidebar-nav-group-title">QUẢN TRỊ HỆ THỐNG</div>
          <nav className="sidebar-nav-list">
            {navigation.map((item) => {
              const active = item.match(pathname);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-nav-item ${active ? "sidebar-nav-item--active" : ""}`}
                  onClick={onClose}
                >
                  <Icon size={19} className="sidebar-nav-item__icon" />
                  <span className="sidebar-nav-item__label">{item.name}</span>
                  {item.badge ? (
                    <span className="sidebar-nav-item__badge">{item.badge}</span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-system-card">
          <div className="sidebar-system-card-glow" />
          <div className="sidebar-system-card-content">
            <div className="sidebar-system-card-header">
              <Sparkles size={16} className="sidebar-system-card-icon" />
              <span>FastAPI Backend</span>
            </div>
            <p className="sidebar-system-card-desc">
              Standard Response JSON & JWT Bearer Security.
            </p>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user-block">
            <div className="sidebar-user-avatar">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="sidebar-user-details">
              <h4 className="sidebar-user-name">
                {user?.full_name || "Đang xác thực..."}
              </h4>
              <div className="sidebar-user-role-badge">
                {user?.role === "ADMIN" ? (
                  <span className="user-role-chip user-role-chip--admin">
                    <ShieldCheck size={12} /> ADMIN
                  </span>
                ) : (
                  <span className="user-role-chip user-role-chip--user">
                    <UserCheck size={12} /> USER
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={logout}
            title="Đăng xuất khỏi hệ thống"
          >
            <LogOut size={16} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}
