"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  FolderOpen,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextAreaField, TextField } from "@/components/ui/Field";
import { Alert, EmptyState } from "@/components/ui/Status";
import { getApiErrorMessage } from "@/lib/api/client";
import type { PaginatedData } from "@/types/api";
import { getAccessToken } from "@/features/auth/token";
import {
  createProject,
  deleteProject,
  getProjects,
} from "../api";
import type { Project } from "../types";

export function ProjectsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [projects, setProjects] = useState<PaginatedData<Project> | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");

  const loadProjects = useCallback(
    async (nextPage = page) => {
      if (!token) {
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const data = await getProjects(
          {
            limit,
            name: nameFilter.trim() || undefined,
            page: nextPage,
          },
          token,
        );
        setProjects(data);
      } catch (requestError) {
        setError(getApiErrorMessage(requestError));
      } finally {
        setIsLoading(false);
      }
    },
    [limit, nameFilter, page, token],
  );

  useEffect(() => {
    setToken(getAccessToken());
  }, []);

  useEffect(() => {
    if (token) {
      void loadProjects();
    }
  }, [loadProjects, token]);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    await loadProjects(1);
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      return;
    }

    setIsCreating(true);
    setError("");
    setMessage("");

    try {
      const createdProject = await createProject(
        {
          description,
          name: projectName,
        },
        token,
      );
      setMessage(`Đã tạo project #${createdProject.id}.`);
      setProjectName("");
      setDescription("");
      setPage(1);
      await loadProjects(1);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDelete(projectId: number) {
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
      setMessage(`Đã xóa project #${projectId}.`);
      await loadProjects();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  }

  function changePage(nextPage: number) {
    setPage(nextPage);
    void loadProjects(nextPage);
  }

  if (!token) {
    return (
      <div className="page-stack">
        <div className="page-title">
          <h1>Projects</h1>
        </div>
        <Alert kind="warning" title="Cần đăng nhập">
          <Link href="/login">Login</Link> trước khi xem projects.
        </Alert>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <div className="page-title">
        <h1>Projects</h1>
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

      <section className="panel">
        <div className="panel__header">
          <h2>Query</h2>
          <Button
            disabled={isLoading}
            onClick={() => void loadProjects()}
            type="button"
            variant="secondary"
          >
            <RefreshCw aria-hidden="true" />
            Reload
          </Button>
        </div>
        <form className="panel__body" onSubmit={handleSearch}>
          <div className="form-row">
            <TextField
              grow
              label="Name"
              name="name"
              onChange={(event) => setNameFilter(event.target.value)}
              type="search"
              value={nameFilter}
            />
            <TextField
              label="Limit"
              max={100}
              min={1}
              name="limit"
              onChange={(event) => setLimit(Number(event.target.value))}
              type="number"
              value={limit}
            />
            <Button disabled={isLoading} type="submit">
              <Search aria-hidden="true" />
              Search
            </Button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel__header">
          <h2>Create project</h2>
        </div>
        <form className="panel__body" onSubmit={handleCreate}>
          <div className="grid grid--two">
            <TextField
              label="Name"
              name="project_name"
              onChange={(event) => setProjectName(event.target.value)}
              required
              value={projectName}
            />
            <TextAreaField
              label="Description"
              name="description"
              onChange={(event) => setDescription(event.target.value)}
              required
              value={description}
            />
          </div>
          <div className="actions">
            <Button disabled={isCreating} type="submit">
              <Plus aria-hidden="true" />
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel__header">
          <h2>Result</h2>
          {projects ? (
            <div className="meta">
              <span>Page {projects.metadata.page}</span>
              <span>Total pages {projects.metadata.total_page}</span>
              <span>Total records {projects.metadata.total_recoder}</span>
            </div>
          ) : null}
        </div>
        <div className="panel__body">
          {isLoading ? <EmptyState>Loading projects...</EmptyState> : null}

          {!isLoading && projects && projects.result.length === 0 ? (
            <EmptyState>Không có project.</EmptyState>
          ) : null}

          {!isLoading && projects && projects.result.length > 0 ? (
            <div className="list">
              {projects.result.map((project) => (
                <article className="resource-card" key={project.id}>
                  <div className="resource-card__header">
                    <div>
                      <h3>{project.name}</h3>
                      <div className="meta">
                        <span className="badge">#{project.id}</span>
                      </div>
                    </div>
                    <div className="actions">
                      <Link className="button button--secondary" href={`/projects/${project.id}`}>
                        <FolderOpen aria-hidden="true" />
                        Detail
                      </Link>
                      <Button
                        onClick={() => void handleDelete(project.id)}
                        type="button"
                        variant="danger"
                      >
                        <Trash2 aria-hidden="true" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  <p>{project.description}</p>
                </article>
              ))}
            </div>
          ) : null}
        </div>
        {projects ? (
          <div className="panel__footer actions">
            <Button
              disabled={page <= 1 || isLoading}
              onClick={() => changePage(page - 1)}
              type="button"
              variant="secondary"
            >
              Previous
            </Button>
            <span className="meta">Page {page}</span>
            <Button
              disabled={
                isLoading ||
                (projects.metadata.total_page > 0 && page >= projects.metadata.total_page)
              }
              onClick={() => changePage(page + 1)}
              type="button"
              variant="secondary"
            >
              Next
            </Button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
