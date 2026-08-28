"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  UserMinus,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextAreaField, TextField } from "@/components/ui/Field";
import { Alert, EmptyState } from "@/components/ui/Status";
import { getAccessToken } from "@/features/auth/token";
import { getApiErrorMessage } from "@/lib/api/client";
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
  const [token, setToken] = useState<string | null>(null);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ownerId, setOwnerId] = useState("0");
  const [memberUserId, setMemberUserId] = useState("");
  const [deleteUserId, setDeleteUserId] = useState("");

  const loadProject = useCallback(async () => {
    if (!token || Number.isNaN(projectId)) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const [projectData, memberData] = await Promise.all([
        getProject(projectId, token),
        getProjectMembers(projectId, token),
      ]);
      setProject(projectData);
      setMembers(memberData);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [projectId, token]);

  useEffect(() => {
    setToken(getAccessToken());
  }, []);

  useEffect(() => {
    if (token) {
      void loadProject();
    }
  }, [loadProject, token]);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      setOwnerId("0");
    }
  }, [project]);

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const updatedProject = await updateProject(
        projectId,
        {
          description,
          name,
          owner_id: Number(ownerId || 0),
        },
        token,
      );
      setMessage(`Đã cập nhật project #${updatedProject.id}.`);
      await loadProject();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteProject() {
    if (!token) {
      return;
    }

    const confirmed = window.confirm(`Xóa project #${projectId}?`);

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await deleteProject(projectId, token);
      router.push("/projects");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  }

  async function handleAddMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await addProjectMember(
        projectId,
        {
          user_id: Number(memberUserId),
        },
        token,
      );
      setMessage(`Đã thêm user #${memberUserId}.`);
      setMemberUserId("");
      await loadProject();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  }

  async function handleDeleteMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await deleteProjectMember(projectId, Number(deleteUserId), token);
      setMessage(`Đã xóa user #${deleteUserId}.`);
      setDeleteUserId("");
      await loadProject();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  }

  if (Number.isNaN(projectId)) {
    return (
      <div className="page-stack">
        <Alert kind="error" title="Invalid project id">
          Project id không hợp lệ.
        </Alert>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="page-stack">
        <div className="actions">
          <Link className="button button--secondary" href="/projects">
            <ArrowLeft aria-hidden="true" />
            Back
          </Link>
        </div>
        <Alert kind="warning" title="Cần đăng nhập">
          <Link href="/login">Login</Link> trước khi xem project.
        </Alert>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <div className="actions">
        <Link className="button button--secondary" href="/projects">
          <ArrowLeft aria-hidden="true" />
          Back
        </Link>
        <Button
          disabled={isLoading}
          onClick={() => void loadProject()}
          type="button"
          variant="secondary"
        >
          <RefreshCw aria-hidden="true" />
          Reload
        </Button>
        <Button onClick={() => void handleDeleteProject()} type="button" variant="danger">
          <Trash2 aria-hidden="true" />
          Delete
        </Button>
      </div>

      <div className="page-title">
        <h1>Project #{projectId}</h1>
        {project ? (
          <p>
            Owner: {project.owner.full_name} ({project.owner.email})
          </p>
        ) : null}
      </div>

      {error ? (
        <Alert kind="error" title="Request error">
          {error}
        </Alert>
      ) : null}
      {message ? (
        <Alert kind="success" title="Success">
          {message}
        </Alert>
      ) : null}

      {isLoading && !project ? <EmptyState>Loading project...</EmptyState> : null}

      {project ? (
        <div className="grid grid--two">
          <section className="panel">
            <div className="panel__header">
              <h2>Update project</h2>
            </div>
            <form className="panel__body" onSubmit={handleUpdate}>
              <TextField
                label="Name"
                name="name"
                onChange={(event) => setName(event.target.value)}
                required
                value={name}
              />
              <TextAreaField
                label="Description"
                name="description"
                onChange={(event) => setDescription(event.target.value)}
                required
                value={description}
              />
              <TextField
                label="Owner id"
                min={0}
                name="owner_id"
                onChange={(event) => setOwnerId(event.target.value)}
                required
                type="number"
                value={ownerId}
              />
              <div className="actions">
                <Button disabled={isSaving} type="submit">
                  <Save aria-hidden="true" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </section>

          <section className="panel">
            <div className="panel__header">
              <h2>Members</h2>
              <span className="badge">{members.length}</span>
            </div>
            <div className="panel__body">
              <form className="form-row" onSubmit={handleAddMember}>
                <TextField
                  grow
                  label="User id"
                  min={1}
                  name="member_user_id"
                  onChange={(event) => setMemberUserId(event.target.value)}
                  required
                  type="number"
                  value={memberUserId}
                />
                <Button type="submit">
                  <Plus aria-hidden="true" />
                  Add
                </Button>
              </form>

              <form className="form-row" onSubmit={handleDeleteMember}>
                <TextField
                  grow
                  label="User id"
                  min={1}
                  name="delete_user_id"
                  onChange={(event) => setDeleteUserId(event.target.value)}
                  required
                  type="number"
                  value={deleteUserId}
                />
                <Button type="submit" variant="danger">
                  <UserMinus aria-hidden="true" />
                  Remove
                </Button>
              </form>

              {members.length === 0 ? (
                <EmptyState>Không có thành viên.</EmptyState>
              ) : (
                <div className="list">
                  {members.map((member) => (
                    <article className="resource-card" key={`${member.email}-${member.role}`}>
                      <div className="resource-card__header">
                        <div>
                          <h3>{member.full_name}</h3>
                          <p>{member.email}</p>
                        </div>
                        <span className="badge">
                          <UsersRound aria-hidden="true" size={14} />
                          {member.role}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
