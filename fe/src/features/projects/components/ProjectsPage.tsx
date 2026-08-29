"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import {
  FolderKanban,
  Plus,
  Search,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ArrowUpRight,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextAreaField, TextField } from "@/components/ui/Field";
import { Alert, EmptyState, Skeleton } from "@/components/ui/Status";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/features/auth/AuthContext";
import { getAccessToken } from "@/features/auth/token";
import type { PaginatedData } from "@/types/api";
import { createProject, deleteProject, getProjects } from "../api";
import type { Project } from "../types";

export function ProjectsPage() {
  const toast = useToast();
  const { token, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [projectsData, setProjectsData] = useState<PaginatedData<Project> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Create Project Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Delete Project Confirm State
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProjects = useCallback(
    async (nextPage = page) => {
      const activeToken = token || getAccessToken();
      if (!activeToken) {
        return;
      }

      setIsLoading(true);

      try {
        const response = await getProjects(
          {
            limit,
            name: nameFilter.trim() || undefined,
            page: nextPage,
          },
          activeToken,
        );
        setProjectsData(response.data);
      } catch (requestError) {
        toast.error(requestError, "Không thể tải danh sách dự án");
      } finally {
        setIsLoading(false);
      }
    },
    [limit, nameFilter, page, toast, token],
  );

  useEffect(() => {
    const activeToken = token || getAccessToken();
    if (activeToken) {
      void loadProjects();
    }
  }, [token, loadProjects]);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    await loadProjects(1);
  }

  async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const activeToken = token || getAccessToken();
    if (!activeToken) return;

    setIsCreating(true);

    try {
      const response = await createProject(
        {
          name: newProjectName.trim(),
          description: newProjectDesc.trim(),
        },
        activeToken,
      );

      // Notification with API message
      toast.success(
        response.message || "Tạo dự án thành công!",
        `Dự án #${response.data.id} "${response.data.name}" đã được khởi tạo.`,
      );

      setNewProjectName("");
      setNewProjectDesc("");
      setIsCreateModalOpen(false);
      setPage(1);
      await loadProjects(1);
    } catch (requestError) {
      toast.error(requestError, "Lỗi tạo dự án");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleConfirmDelete() {
    const activeToken = token || getAccessToken();
    if (!activeToken || deleteTargetId === null) return;

    setIsDeleting(true);

    try {
      await deleteProject(deleteTargetId, activeToken);
      toast.success("Xóa dự án thành công!", `Dự án #${deleteTargetId} đã được gỡ bỏ khỏi hệ thống.`);
      setDeleteTargetId(null);
      await loadProjects();
    } catch (requestError) {
      toast.error(requestError, "Lỗi xóa dự án");
    } finally {
      setIsDeleting(false);
    }
  }

  function changePage(nextPage: number) {
    setPage(nextPage);
    void loadProjects(nextPage);
  }

  if (isAuthLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <Skeleton height={80} />
        <div className="stats-grid">
          <Skeleton height={90} />
          <Skeleton height={90} />
          <Skeleton height={90} />
        </div>
        <Skeleton height={300} />
      </div>
    );
  }

  if (!isAuthenticated && !token && !getAccessToken()) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div className="page-header-block">
          <div className="page-header-text">
            <h1 className="page-main-heading">Dự án (Projects)</h1>
            <p className="page-sub-heading">
              Quản lý toàn bộ danh sách dự án và các thành viên tham gia
            </p>
          </div>
        </div>

        <Alert kind="warning" title="Yêu cầu đăng nhập">
          Vui lòng <Link href="/login" style={{ textDecoration: "underline", fontWeight: 700 }}>Đăng nhập</Link> bằng tài khoản của bạn để truy cập danh sách dự án.
        </Alert>
      </div>
    );
  }

  const totalRecord = projectsData?.metadata?.total_recoder ?? 0;
  const totalPages = projectsData?.metadata?.total_page ?? 1;
  const currentPage = projectsData?.metadata?.page ?? 1;
  const projectsList = projectsData?.result || [];

  return (
    <div className="projects-page-container">
      {/* Top Banner / Actions Bar */}
      <div className="page-header-block">
        <div className="page-header-text">
          <h1 className="page-main-heading">Quản lý Dự án</h1>
          <p className="page-sub-heading">
            Tổng quan tất cả các dự án, thành viên tham gia và phân quyền điều phối
          </p>
        </div>
        <div className="page-header-actions">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus size={18} />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Tạo dự án mới
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__icon-wrap stat-card__icon-wrap--primary">
            <FolderKanban size={22} />
          </div>
          <div className="stat-card__details">
            <span className="stat-card__label">Tổng số dự án</span>
            <div className="stat-card__value">
              {isLoading && !projectsData ? <Skeleton width={40} height={28} /> : totalRecord}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon-wrap stat-card__icon-wrap--success">
            <Layers size={22} />
          </div>
          <div className="stat-card__details">
            <span className="stat-card__label">Trang hiện tại</span>
            <div className="stat-card__value">
              {currentPage} / {totalPages}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon-wrap stat-card__icon-wrap--info">
            <Sparkles size={22} />
          </div>
          <div className="stat-card__details">
            <span className="stat-card__label">Dự án trên trang</span>
            <div className="stat-card__value">{projectsList.length}</div>
          </div>
        </div>
      </div>

      {/* Filter and View Mode Toolbar */}
      <div className="table-toolbar">
        <form className="table-search-form" onSubmit={handleSearch}>
          <div className="search-input-wrap">
            <Search size={17} className="search-input-icon" />
            <input
              type="text"
              className="table-search-input"
              placeholder="Tìm kiếm dự án theo tên..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary" size="md" isLoading={isLoading}>
            Tìm kiếm
          </Button>
          {nameFilter ? (
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={async () => {
                setNameFilter("");
                setPage(1);
                const activeToken = token || getAccessToken();
                if (activeToken) {
                  const res = await getProjects({ limit, page: 1 }, activeToken);
                  setProjectsData(res.data);
                }
              }}
            >
              Xóa bộ lọc
            </Button>
          ) : null}
        </form>

        <div className="table-view-controls">
          <div className="limit-selector-wrap">
            <span className="limit-label">Hiển thị:</span>
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

          <div className="view-mode-toggle">
            <button
              type="button"
              className={`view-mode-btn ${viewMode === "grid" ? "view-mode-btn--active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Xem dạng Lưới"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              className={`view-mode-btn ${viewMode === "table" ? "view-mode-btn--active" : ""}`}
              onClick={() => setViewMode("table")}
              title="Xem dạng Bảng"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Display Area */}
      {isLoading ? (
        <div className="projects-loading-grid">
          <Skeleton height={140} rounded="lg" />
          <Skeleton height={140} rounded="lg" />
          <Skeleton height={140} rounded="lg" />
        </div>
      ) : projectsList.length === 0 ? (
        <EmptyState
          title="Không tìm thấy dự án nào"
          description={
            nameFilter
              ? `Không có kết quả nào khớp với từ khóa "${nameFilter}". Hãy thử tìm kiếm từ khóa khác.`
              : "Hệ thống chưa có dự án nào. Hãy tạo dự án đầu tiên ngay!"
          }
          icon={<FolderKanban size={48} />}
          action={
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus size={16} />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Tạo dự án mới
            </Button>
          }
        />
      ) : viewMode === "grid" ? (
        <div className="projects-grid">
          {projectsList.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-card__header">
                <div className="project-card__badge-wrap">
                  <span className="project-id-chip">#{project.id}</span>
                </div>
                <div className="project-card__actions">
                  <button
                    type="button"
                    className="project-action-icon-btn project-action-icon-btn--danger"
                    onClick={() => setDeleteTargetId(project.id)}
                    title="Xóa dự án"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="project-card__body">
                <h3 className="project-card__title">{project.name}</h3>
                <p className="project-card__desc">
                  {project.description || "Không có mô tả cho dự án này."}
                </p>
              </div>

              <div className="project-card__footer">
                <Link
                  href={`/projects/${project.id}`}
                  className="project-card__detail-link"
                >
                  <span>Chi tiết & Thành viên</span>
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="data-table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "80px" }}>ID</th>
                <th>Tên Dự án</th>
                <th>Mô tả</th>
                <th style={{ width: "160px", textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {projectsList.map((project) => (
                <tr key={project.id}>
                  <td>
                    <span className="project-id-chip">#{project.id}</span>
                  </td>
                  <td className="table-cell-title">
                    <Link
                      href={`/projects/${project.id}`}
                      className="table-title-link"
                    >
                      {project.name}
                    </Link>
                  </td>
                  <td className="table-cell-desc">
                    {project.description || "Chưa có mô tả"}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div className="table-row-actions">
                      <Link
                        href={`/projects/${project.id}`}
                        className="btn btn--outline btn--sm"
                      >
                        Chi tiết
                      </Link>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm btn--danger-text"
                        onClick={() => setDeleteTargetId(project.id)}
                        title="Xóa dự án"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 ? (
        <div className="pagination-bar">
          <div className="pagination-info">
            Trang <strong>{currentPage}</strong> trên <strong>{totalPages}</strong> (Tổng <strong>{totalRecord}</strong> dự án)
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

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Khởi tạo dự án mới"
        description="Điền tên và thông tin mô tả chi tiết để tạo dự án trên hệ thống."
      >
        <form onSubmit={handleCreateProject} className="modal-form">
          <TextField
            label="Tên dự án"
            placeholder="VD: Cổng dịch vụ trực tuyến"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            required
            autoFocus
          />
          <TextAreaField
            label="Mô tả dự án"
            placeholder="Nhập mục tiêu, phạm vi và thông tin tổng quan..."
            value={newProjectDesc}
            onChange={(e) => setNewProjectDesc(e.target.value)}
            rows={4}
          />
          <div className="modal-actions-right">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isCreating}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isCreating}
              leftIcon={<Plus size={16} />}
            >
              Tạo dự án
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa dự án"
        message={`Bạn có chắc chắn muốn xóa dự án #${deleteTargetId}? Hành động này sẽ gỡ bỏ dự án cùng tất cả liên kết thành viên khỏi hệ thống.`}
        confirmText="Xóa vĩnh viễn"
        cancelText="Hủy"
        isDanger
        isLoading={isDeleting}
      />
    </div>
  );
}
