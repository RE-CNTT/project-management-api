"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Status";
import { getApiErrorMessage } from "@/lib/api/client";
import { login, registerUser } from "../api";
import { saveAccessToken } from "../token";

type AuthMode = "login" | "register";

export function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLoginMode = mode === "login";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      if (isLoginMode) {
        const auth = await login({ email, password });
        saveAccessToken(auth.access_token);
        setMessage(`Đăng nhập thành công. Token type: ${auth.type}`);
        router.push("/projects");
        return;
      }

      const user = await registerUser({
        email,
        full_name: fullName,
        password,
      });
      setMessage(`Đã tạo tài khoản ${user.email}.`);
      setMode("login");
      setPassword("");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-stack">
      <div className="page-title">
        <h1>Authentication</h1>
      </div>

      <section className="panel">
        <div className="panel__header">
          <h2>{isLoginMode ? "Login" : "Register"}</h2>
          <div className="segmented" aria-label="Authentication mode">
            <Button
              type="button"
              variant={isLoginMode ? "primary" : "secondary"}
              onClick={() => setMode("login")}
            >
              <LogIn aria-hidden="true" />
              Login
            </Button>
            <Button
              type="button"
              variant={!isLoginMode ? "primary" : "secondary"}
              onClick={() => setMode("register")}
            >
              <UserPlus aria-hidden="true" />
              Register
            </Button>
          </div>
        </div>

        <form className="panel__body" onSubmit={handleSubmit}>
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

          <TextField
            autoComplete="email"
            label="Email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />

          {!isLoginMode ? (
            <TextField
              autoComplete="name"
              label="Full name"
              name="full_name"
              onChange={(event) => setFullName(event.target.value)}
              required
              type="text"
              value={fullName}
            />
          ) : null}

          <TextField
            autoComplete={isLoginMode ? "current-password" : "new-password"}
            label="Password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />

          <div className="actions">
            <Button disabled={isSubmitting} type="submit">
              {isLoginMode ? <LogIn aria-hidden="true" /> : <UserPlus aria-hidden="true" />}
              {isSubmitting ? "Sending..." : isLoginMode ? "Login" : "Register"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
