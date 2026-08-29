"use client";

import { useState, type FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  LogIn,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { getAccessToken, saveAccessToken } from "../token";
import { useAuth } from "../AuthContext";
import { login, registerUser } from "../api";

type AuthMode = "login" | "register";

export function AuthPage() {
  const router = useRouter();
  const toast = useToast();
  const { setSession } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoginMode = mode === "login";

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      router.replace("/projects");
    }
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (isLoginMode) {
        const response = await login({ email, password });
        saveAccessToken(response.data.access_token);
        await setSession(response.data.access_token);
        
        toast.success(
          response.message || "Đăng nhập thành công!",
          `Chào mừng bạn quay trở lại!`,
        );
        window.location.href = "/projects";
        return;
      }

      const response = await registerUser({
        email,
        full_name: fullName,
        password,
      });

      toast.success(
        response.message || "Đăng ký thành công!",
        `Tài khoản ${response.data.email} đã sẵn sàng. Vui lòng đăng nhập.`,
      );
      setMode("login");
      setPassword("");
    } catch (requestError) {
      toast.error(requestError, isLoginMode ? "Đăng nhập thất bại" : "Đăng ký thất bại");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-container">
      {/* Left visual showcase panel */}
      <div className="auth-hero-panel">
        <div className="auth-hero-glow" />
        <div className="auth-hero-content">
          <div className="auth-hero-brand">
            <div className="auth-hero-brand-icon">
              <Layers size={28} />
            </div>
            <div>
              <h1 className="auth-hero-brand-title">ProjectHub CMS</h1>
              <span className="auth-hero-brand-subtitle">FastAPI & Next.js Enterprise Architecture</span>
            </div>
          </div>

          <div className="auth-hero-quote">
            <h2 className="auth-hero-quote-heading">
              Hệ thống Quản trị & Điều phối Dự án Chuyên nghiệp.
            </h2>
            <p className="auth-hero-quote-text">
              Kiến trúc chuẩn phân tách Frontend/Backend với FastAPI, bảo mật JWT Bearer token,
              tự động trích xuất thông báo phản hồi và phân quyền người dùng thông minh.
            </p>
          </div>

          <div className="auth-hero-features">
            <div className="auth-hero-feature-item">
              <CheckCircle2 size={18} className="auth-hero-feature-icon" />
              <span>Chuẩn dữ liệu StandardResponse (JSON Body & Query Filters)</span>
            </div>
            <div className="auth-hero-feature-item">
              <CheckCircle2 size={18} className="auth-hero-feature-icon" />
              <span>Bảo vệ phiên làm việc & Tự động gia hạn đăng nhập</span>
            </div>
            <div className="auth-hero-feature-item">
              <CheckCircle2 size={18} className="auth-hero-feature-icon" />
              <span>Quản trị phân quyền Admin & phân chia thành viên dự án</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right form card panel */}
      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-card-header">
            <div className="auth-card-mode-pill">
              {isLoginMode ? <LogIn size={14} /> : <UserPlus size={14} />}
              <span>{isLoginMode ? "ĐĂNG NHẬP" : "ĐĂNG KÝ MỚI"}</span>
            </div>
            <h2 className="auth-card-title">
              {isLoginMode ? "Đăng nhập vào hệ thống" : "Tạo tài khoản mới"}
            </h2>
            <p className="auth-card-subtitle">
              {isLoginMode
                ? "Nhập email và mật khẩu của bạn để truy cập bảng điều khiển."
                : "Điền thông tin để khởi tạo tài khoản quản trị viên hoặc thành viên."}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLoginMode ? (
              <TextField
                label="Họ và tên"
                name="fullName"
                type="text"
                placeholder="VD: Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftIcon={<User size={16} />}
                required
              />
            ) : null}

            <TextField
              label="Email"
              name="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={16} />}
              required
            />

            <div className="auth-password-field-wrap">
              <TextField
                label="Mật khẩu"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock size={16} />}
                required
              />
              <button
                type="button"
                className="auth-password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Button
              type="submit"
              size="lg"
              variant="primary"
              className="auth-submit-btn"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight size={18} />}
            >
              {isLoginMode ? "Đăng nhập ngay" : "Tạo tài khoản"}
            </Button>
          </form>

          <div className="auth-card-footer">
            <p className="auth-card-switch-text">
              {isLoginMode
                ? "Chưa có tài khoản quản trị?"
                : "Đã có tài khoản?"}{" "}
              <button
                type="button"
                className="auth-card-switch-link"
                onClick={() => {
                  setMode(isLoginMode ? "register" : "login");
                }}
              >
                {isLoginMode ? "Đăng ký tài khoản mới" : "Quay lại đăng nhập"}
              </button>
            </p>
          </div>

          <div className="auth-security-notice">
            <ShieldCheck size={14} />
            <span>Mọi kết nối được mã hóa chuẩn JWT Token bảo mật</span>
          </div>
        </div>
      </div>
    </div>
  );
}
