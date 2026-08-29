"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Crown,
  Edit3,
  Mail,
  Plus,
  Save,
  Trash2,
  Users,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextAreaField, TextField } from "@/components/ui/Field";
import { Alert, Badge, EmptyState, Skeleton } from "@/components/ui/Status";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/features/auth/AuthContext";
import { getAccessToken } from "@/features/auth/token";
import {
  addProjectMember,
  deleteProject,
  deleteProjectMember,
  getProject,
  getProjectMembers,
  updateProject,
} from "../api";
import type { ProjectDetail, ProjectMember } from "../types";

interface ProjectDetailViewProps {
  projectId: number;
}

export function ProjectDetailView({ projectId }: ProjectDetailViewProps) {
  const router = useRouter();
  const toast = useToast();
  const { token, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ownerId, setOwnerId] = useState("0");

  // Member Modal State
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [newMemberUserId, setNewMemberUserId] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Member Removal Confirm State
  const [deleteMemberTarget, setDeleteMemberTarget] = useState<number | null>(null);
  const [isDeletingMember, setIsDeletingMember] = useState(false);

  // Delete Project Confirm State
  const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  const loadProject = useCallback(async () => {
    const activeToken = token || getAccessToken();
    if (!activeToken || Number.isNaN(projectId)) {
      return;
    }

    setIsLoading(true);

    try {
      const [projectRes, memberRes] = await Promise.all([
        getProject(projectId, activeToken),
        getProjectMembers(projectId, activeToken),
      ]);
      setProject(projectRes.data);
      setMembers(memberRes.data || []);
    } catch (requestError) {
      toast.error(requestError, "Không thể tải chi tiết dự án");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, toast, token]);

  useEffect(() => {
    const activeToken = token || getAccessToken();
    if (activeToken) {
      void loadProject();
    }
  }, [token, loadProject]);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      setOwnerId("0");
    }
  }, [project]);

  async function handleUpdateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const activeToken = token || getAccessToken();
    if (!activeToken) return;

    setIsSaving(true);

    try {
      const response = await updateProject(
        projectId,
        {
          name: name.trim(),
          description: description.trim(),
          owner_id: Number(ownerId || 0),
        },
        activeToken,
      );

      toast.success(
        response.message || "Cập nhật thành công!",
        `Dự án #${response.data.id} đã được lưu thông tin mới.`,
      );
      await loadProject();
    } catch (requestError) {
      toast.error(requestError, "Lỗi cập nhật dự án");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteProject() {
    const activeToken = token || getAccessToken();
    if (!activeToken) return;

    setIsDeletingProject(true);

    try {
      await deleteProject(projectId, activeToken);
      toast.success("Xóa dự án thành công!", `Dự án #${projectId} đã được gỡ bỏ.`);
      router.push("/projects");
    } catch (requestError) {
      toast.error(requestError, "Lỗi xóa dự án");
    } finally {
      setIsDeletingProject(false);
    }
  }

  async function handleAddMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const activeToken = token || getAccessToken();
    if (!activeToken) return;

    const parsedUserId = Number(newMemberUserId);
    if (!parsedUserId || Number.isNaN(parsedUserId)) {
      toast.error("Vui lòng nhập User ID hợp lệ");
      return;
    }

    setIsAddingMember(true);

    try {
      const response = await addProjectMember(
        projectId,
        {
          user_id: parsedUserId,
        },
        activeToken,
      );

      toast.success(
        response.message || "Thêm thành viên thành công!",
        `Đã thêm User #${parsedUserId} vào dự án.`,
      );
      setNewMemberUserId("");
      setIsAddMemberModalOpen(false);
      await loadProject();
    } catch (requestError) {
      toast.error(requestError, "Lỗi thêm thành viên");
    } finally {
      setIsAddingMember(false);
    }
  }

  async function handleConfirmDeleteMember() {
    const activeToken = token || getAccessToken();
    if (!activeToken || deleteMemberTarget === null) return;

    setIsDeletingMember(true);

    try {
      await deleteProjectMember(projectId, deleteMemberTarget, activeToken);
      toast.success("Xóa thành viên thành công!", `Đã gỡ bỏ thành viên #${deleteMemberTarget} khỏi dự án.`);
      setDeleteMemberTarget(null);
      await loadProject();
    } catch (requestError) {
      toast.error(requestError, "Lỗi xóa thành viên");
    } finally {
      setIsDeletingMember(false);
    }
  }

  if (isAuthLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <Skeleton height={50} />
        <Skeleton height={200} />
        <Skeleton height={300} />
      </div>
    );
  }

  if (!isAuthenticated && !token && !getAccessToken()) {
    return (
      <Alert kind="warning" title="Yêu cầu đăng nhập">
        Vui lòng <Link href="/login" style={{ textDecoration: "underline" }}>Đăng nhập</Link> để xem chi tiết dự án.
      </Alert>
    );
  }

  return (
    <div className="project-detail-container">
      {/* Navigation Topbar */}
      <div className="project-detail-header">
        <Link href="/projects" className="back-nav-btn">
          <ArrowLeft size={18} />
          <span>Danh sách dự án</span>
        </Link>
        <div className="project-detail-header-actions">
          <Button
            variant="danger"
            size="md"
            leftIcon={<Trash2 size={16} />}
            onClick={() => setIsDeleteProjectModalOpen(true)}
          >
            Xóa dự án này
          </Button>
        </div>
      </div>

      {isLoading && !project ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <Skeleton height={120} rounded="lg" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <Skeleton height={300} rounded="lg" />
            <Skeleton height={300} rounded="lg" />
          </div>
        </div>
      ) : !project ? (
        <EmptyState
          title="Không tìm thấy thông tin dự án"
          description="Dự án có thể đã bị xóa hoặc bạn không có quyền truy cập."
          action={
            <Link href="/projects" className="btn btn--primary btn--md">
              Quay lại danh sách
            </Link>
          }
        />
      ) : (
        <div className="project-detail-content-grid">
          {/* Main Info & Edit Form Column */}
          <div className="detail-col detail-col--main">
            <div className="detail-card">
              <div className="detail-card-header">
                <div className="detail-card-title-wrap">
                  <span className="project-id-chip">DỰ ÁN #{project.id}</span>
                  <h2 className="detail-card-title">{project.name}</h2>
                </div>
                <Badge variant="primary" size="md">
                  Active
                </Badge>
              </div>

              <div className="detail-card-body">
                {/* Project Owner Card */}
                <div className="project-owner-banner">
                  <div className="project-owner-avatar">
                    <Crown size={20} className="owner-crown-icon" />
                  </div>
                  <div className="project-owner-info">
                    <span className="owner-label">Chủ dự án (Owner)</span>
                    <h4 className="owner-name">
                      {project.owner?.full_name || "Chưa thiết lập"}
                    </h4>
                    <p className="owner-email">
                      <Mail size={13} style={{ marginRight: 4 }} />
                      {project.owner?.email || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Edit Form */}
                <form onSubmit={handleUpdateProject} className="project-edit-form">
                  <h3 className="form-section-title">
                    <Edit3 size={17} />
                    <span>Chỉnh sửa thông tin dự án</span>
                  </h3>

                  <TextField
                    label="Tên dự án"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />

                  <TextAreaField
                    label="Mô tả dự án"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />

                  <TextField
                    label="Owner ID (Chuyển quyền sở hữu nếu cần)"
                    type="number"
                    value={ownerId}
                    onChange={(e) => setOwnerId(e.target.value)}
                    hint="Nhập ID người dùng để chuyển quyền owner, hoặc giữ 0 để không đổi"
                  />

                  <div className="form-submit-row">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={isSaving}
                      leftIcon={<Save size={16} />}
                    >
                      Lưu thay đổi
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Members Column */}
          <div className="detail-col detail-col--sidebar">
            <div className="detail-card">
              <div className="detail-card-header">
                <div className="detail-card-title-wrap">
                  <Users size={20} className="section-icon" />
                  <h3 className="detail-card-title">Thành viên ({members.length})</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus size={14} />}
                  onClick={() => setIsAddMemberModalOpen(true)}
                >
                  Thêm
                </Button>
              </div>

              <div className="detail-card-body">
                {members.length === 0 ? (
                  <div className="empty-members-box">
                    <UserCheck size={32} className="empty-members-icon" />
                    <p className="empty-members-text">
                      Chưa có thành viên nào trong dự án này.
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsAddMemberModalOpen(true)}
                    >
                      Thêm thành viên ngay
                    </Button>
                  </div>
                ) : (
                  <div className="members-list">
                    {members.map((member, index) => (
                      <div key={`${member.email}-${index}`} className="member-row">
                        <div className="member-avatar">
                          {member.full_name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="member-details">
                          <h4 className="member-name">{member.full_name}</h4>
                          <span className="member-email">{member.email}</span>
                          <span className="member-role-badge">{member.role}</span>
                        </div>
                        <button
                          type="button"
                          className="member-remove-btn"
                          onClick={() => setDeleteMemberTarget(index + 1)}
                          title="Xóa thành viên"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        title="Thêm thành viên vào dự án"
        description={`Nhập ID người dùng để cấp quyền tham gia dự án #${projectId}.`}
      >
        <form onSubmit={handleAddMember} className="modal-form">
          <TextField
            label="User ID"
            placeholder="VD: 2"
            type="number"
            value={newMemberUserId}
            onChange={(e) => setNewMemberUserId(e.target.value)}
            required
            autoFocus
            hint="Nhập ID định danh của người dùng từ danh sách Users"
          />

          <div className="modal-actions-right">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddMemberModalOpen(false)}
              disabled={isAddingMember}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isAddingMember}
              leftIcon={<Plus size={16} />}
            >
              Thêm thành viên
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Member Modal */}
      <ConfirmModal
        isOpen={deleteMemberTarget !== null}
        onClose={() => setDeleteMemberTarget(null)}
        onConfirm={handleConfirmDeleteMember}
        title="Gỡ thành viên khỏi dự án"
        message="Bạn có chắc chắn muốn gỡ thành viên này khỏi dự án?"
        confirmText="Gỡ thành viên"
        cancelText="Hủy"
        isDanger
        isLoading={isDeletingMember}
      />

      {/* Confirm Delete Project Modal */}
      <ConfirmModal
        isOpen={isDeleteProjectModalOpen}
        onClose={() => setIsDeleteProjectModalOpen(false)}
        onConfirm={handleDeleteProject}
        title="Xác nhận xóa toàn bộ dự án"
        message={`Hành động này sẽ xóa vĩnh viễn dự án #${projectId} và không thể hoàn tác.`}
        confirmText="Xóa dự án"
        cancelText="Hủy"
        isDanger
        isLoading={isDeletingProject}
      />
    </div>
  );
}
