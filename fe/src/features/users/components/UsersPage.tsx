"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Mail,
  ShieldCheck,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert, Badge, EmptyState, Skeleton } from "@/components/ui/Status";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/features/auth/AuthContext";
import { getAccessToken } from "@/features/auth/token";
import type { PaginatedData } from "@/types/api";
import { getUsers } from "../api";
import type { ResponseUser } from "../types";

export function UsersPage() {
  const toast = useToast();
  const { token, user: me, isAuthenticated, isAdmin, isLoading: isAuthLoading } = useAuth();

  const [usersData, setUsersData] = useState<PaginatedData<ResponseUser> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [hasPermissionError, setHasPermissionError] = useState(false);

  const loadUsers = useCallback(
    async (nextPage = page) => {
      const activeToken = token || getAccessToken();
      if (!activeToken) {
        return;
      }

      setIsLoading(true);
      setHasPermissionError(false);

      try {
        const response = await getUsers(
          {
            email: emailFilter.trim() || undefined,
            limit,
            name: nameFilter.trim() || undefined,
            page: nextPage,
          },
          activeToken,
        );
        setUsersData(response.data);
      } catch (requestError) {
        toast.error(requestError, "Không thể tải danh sách người dùng");
        setHasPermissionError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [emailFilter, limit, nameFilter, page, toast, token],
  );

  useEffect(() => {
    const activeToken = token || getAccessToken();
    if (activeToken) {
      void loadUsers();
    }
  }, [token, loadUsers]);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    await loadUsers(1);
  }

  function changePage(nextPage: number) {
    setPage(nextPage);
    void loadUsers(nextPage);
  }

  if (isAuthLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <Skeleton height={80} />
        <Skeleton height={300} />
      </div>
    );
  }

  if (!isAuthenticated && !token && !getAccessToken()) {
    return (
      <Alert kind="warning" title="Yêu cầu đăng nhập">
        Vui lòng <Link href="/login" style={{ textDecoration: "underline" }}>Đăng nhập</Link> để quản lý người dùng.
      </Alert>
    );
  }

  const usersList = usersData?.result || [];
  const totalRecord = usersData?.metadata?.total_recoder ?? 0;
  const totalPages = usersData?.metadata?.total_page ?? 1;
  const currentPage = usersData?.metadata?.page ?? 1;

  return (
    <div className="users-page-container">
      {/* Header */}
      <div className="page-header-block">
        <div className="page-header-text">
          <h1 className="page-main-heading">Quản trị Người dùng (Users)</h1>
          <p className="page-sub-heading">
            Xem danh sách tài khoản, trạng thái hoạt động và vai trò trên hệ thống
          </p>
        </div>
      </div>

      {/* Admin Notice or Forbidden Alert */}
      {!isAdmin && hasPermissionError ? (
        <Alert
          kind="error"
          title="Quyền truy cập bị hạn chế"
          action={
            <Link href="/projects" className="btn btn--secondary btn--sm">
              Về trang Dự án
            </Link>
          }
        >
          Endpoint <code>/api/v1/users</code> chỉ dành riêng cho tài khoản có vai trò <strong>ADMIN</strong>. Tài khoản hiện tại của bạn là <strong>{me?.role || "USER"}</strong>.
        </Alert>
      ) : null}

      {/* Metrics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__icon-wrap stat-card__icon-wrap--primary">
            <Users size={22} />
          </div>
          <div className="stat-card__details">
            <span className="stat-card__label">Tổng số người dùng</span>
            <div className="stat-card__value">
              {isLoading && !usersData ? <Skeleton width={40} height={28} /> : totalRecord}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon-wrap stat-card__icon-wrap--success">
            <ShieldCheck size={22} />
          </div>
          <div className="stat-card__details">
            <span className="stat-card__label">Vai trò của bạn</span>
            <div className="stat-card__value" style={{ fontSize: "1.2rem", fontWeight: 700 }}>
              {me?.role || "USER"}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon-wrap stat-card__icon-wrap--info">
            <Sparkles size={22} />
          </div>
          <div className="stat-card__details">
            <span className="stat-card__label">Trang hiện tại</span>
            <div className="stat-card__value">
              {currentPage} / {totalPages}
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar Search Form */}
      <div className="table-toolbar">
        <form className="table-search-form" onSubmit={handleSearch}>
          <div className="search-input-wrap">
            <Search size={16} className="search-input-icon" />
            <input
              type="text"
              className="table-search-input"
              placeholder="Lọc theo họ tên..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
          </div>

          <div className="search-input-wrap">
            <Mail size={16} className="search-input-icon" />
            <input
              type="text"
              className="table-search-input"
              placeholder="Lọc theo email..."
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
            />
          </div>

          <Button type="submit" variant="secondary" size="md" isLoading={isLoading}>
            Lọc kết quả
          </Button>

          {nameFilter || emailFilter ? (
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={async () => {
                setNameFilter("");
                setEmailFilter("");
                setPage(1);
                const activeToken = token || getAccessToken();
                if (activeToken) {
                  const res = await getUsers({ limit, page: 1 }, activeToken);
                  setUsersData(res.data);
                }
              }}
            >
              Đặt lại
            </Button>
          ) : null}
        </form>

        <div className="limit-selector-wrap">
          <span className="limit-label">Số dòng:</span>
          <select
            className="limit-select"
            value={limit}
            onChange={(e) => {
              const newLimit = Number(e.target.value);
              setLimit(newLimit);
              setPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Users Data Table */}
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Skeleton height={50} rounded="lg" />
          <Skeleton height={50} rounded="lg" />
          <Skeleton height={50} rounded="lg" />
        </div>
      ) : hasPermissionError ? (
        <div className="data-table-card" style={{ padding: "40px 20px", textAlign: "center" }}>
          <ShieldAlert size={48} style={{ color: "var(--danger-500)", margin: "0 auto 16px" }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "8px" }}>
            Không đủ thẩm quyền truy cập danh sách
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: "460px", margin: "0 auto 16px" }}>
            Backend API áp dụng chính sách <code>RoleChecker([&quot;ADMIN&quot;])</code> cho tuyến đường này. Hãy đăng nhập bằng tài khoản Quản trị viên để xem dữ liệu.
          </p>
        </div>
      ) : usersList.length === 0 ? (
        <EmptyState
          title="Không tìm thấy người dùng nào"
          description="Thử thay đổi bộ lọc tìm kiếm tên hoặc email để xem kết quả."
          icon={<Users size={48} />}
        />
      ) : (
        <div className="data-table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "70px" }}>ID</th>
                <th>Người dùng</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((user) => (
                <tr key={user.id}>
                  <td>
                    <span className="project-id-chip">#{user.id}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div className="member-avatar">
                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
                        {user.full_name}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ color: "var(--text-muted)", fontFamily: "monospace" }}>
                      {user.email}
                    </span>
                  </td>
                  <td>
                    {user.role === "ADMIN" ? (
                      <span className="user-role-chip user-role-chip--admin">
                        <ShieldCheck size={12} /> ADMIN
                      </span>
                    ) : (
                      <span className="user-role-chip user-role-chip--user">
                        <UserCheck size={12} /> USER
                      </span>
                    )}
                  </td>
                  <td>
                    {user.is_active ? (
                      <Badge variant="success" size="sm" dot>
                        Hoạt động
                      </Badge>
                    ) : (
                      <Badge variant="danger" size="sm" dot>
                        Đã khóa
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !hasPermissionError ? (
        <div className="pagination-bar">
          <div className="pagination-info">
            Trang <strong>{currentPage}</strong> trên <strong>{totalPages}</strong> (Tổng <strong>{totalRecord}</strong> người dùng)
          </div>
          <div className="pagination-buttons">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ChevronLeft size={16} />}
              disabled={currentPage <= 1 || isLoading}
              onClick={() => changePage(currentPage - 1)}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              rightIcon={<ChevronRight size={16} />}
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => changePage(currentPage + 1)}
            >
              Tiếp
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
