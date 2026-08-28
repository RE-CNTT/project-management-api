"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { RefreshCw, Search, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { Alert, EmptyState } from "@/components/ui/Status";
import { getAccessToken } from "@/features/auth/token";
import { getApiErrorMessage } from "@/lib/api/client";
import type { PaginatedData } from "@/types/api";
import { getMe, getUsers } from "../api";
import type { ResponseUser } from "../types";

export function UsersPage() {
  const [token, setToken] = useState<string | null>(null);
  const [me, setMe] = useState<ResponseUser | null>(null);
  const [users, setUsers] = useState<PaginatedData<ResponseUser> | null>(null);
  const [error, setError] = useState("");
  const [meError, setMeError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const loadMe = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      const currentUser = await getMe(token);
      setMe(currentUser);
      setMeError("");
    } catch (requestError) {
      setMeError(getApiErrorMessage(requestError));
    }
  }, [token]);

  const loadUsers = useCallback(
    async (nextPage = page) => {
      if (!token) {
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const data = await getUsers(
          {
            email: email.trim() || undefined,
            limit,
            name: name.trim() || undefined,
            page: nextPage,
          },
          token,
        );
        setUsers(data);
      } catch (requestError) {
        setError(getApiErrorMessage(requestError));
      } finally {
        setIsLoading(false);
      }
    },
    [email, limit, name, page, token],
  );

  useEffect(() => {
    setToken(getAccessToken());
  }, []);

  useEffect(() => {
    if (token) {
      void loadMe();
      void loadUsers();
    }
  }, [loadMe, loadUsers, token]);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    await loadUsers(1);
  }

  function changePage(nextPage: number) {
    setPage(nextPage);
    void loadUsers(nextPage);
  }

  if (!token) {
    return (
      <div className="page-stack">
        <div className="page-title">
          <h1>Users</h1>
        </div>
        <Alert kind="warning" title="Cần đăng nhập">
          <Link href="/login">Login</Link> trước khi xem users.
        </Alert>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <div className="page-title">
        <h1>Users</h1>
      </div>

      {meError ? (
        <Alert kind="error" title="Me error">
          {meError}
        </Alert>
      ) : null}

      {me ? (
        <section className="panel">
          <div className="panel__header">
            <h2>Me</h2>
            <span className="badge">{me.role}</span>
          </div>
          <div className="panel__body">
            <div className="meta">
              <UserRound aria-hidden="true" size={16} />
              <span>#{me.id}</span>
              <span>{me.full_name}</span>
              <span>{me.email}</span>
              <span>{me.is_active ? "active" : "inactive"}</span>
            </div>
          </div>
        </section>
      ) : null}

      {error ? (
        <Alert kind="error" title="Users error">
          {error}
        </Alert>
      ) : null}

      <section className="panel">
        <div className="panel__header">
          <h2>Query users</h2>
          <Button
            disabled={isLoading}
            onClick={() => void loadUsers()}
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
              onChange={(event) => setName(event.target.value)}
              value={name}
            />
            <TextField
              grow
              label="Email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
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
          <h2>Result</h2>
          {users ? (
            <div className="meta">
              <span>Page {users.metadata.page}</span>
              <span>Total pages {users.metadata.total_page}</span>
              <span>Total records {users.metadata.total_recoder}</span>
            </div>
          ) : null}
        </div>
        <div className="panel__body">
          {isLoading ? <EmptyState>Loading users...</EmptyState> : null}
          {!isLoading && users && users.result.length === 0 ? (
            <EmptyState>Không có user.</EmptyState>
          ) : null}
          {!isLoading && users && users.result.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Full name</th>
                    <th>Role</th>
                    <th>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {users.result.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.email}</td>
                      <td>{user.full_name}</td>
                      <td>{user.role}</td>
                      <td>{user.is_active ? "true" : "false"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
        {users ? (
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
                (users.metadata.total_page > 0 && page >= users.metadata.total_page)
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
