"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import { getApiErrorMessage } from "@/lib/api/client";
import type { ToastItem, ToastType } from "@/types/api";

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, "id">) => string;
  removeToast: (id: string) => void;
  success: (message: string, detail?: string, duration?: number) => string;
  error: (error: unknown, title?: string, duration?: number) => string;
  warning: (message: string, detail?: string, duration?: number) => string;
  info: (message: string, detail?: string, duration?: number) => string;
  notifyApiResponse: (response: { message?: string }, fallbackMessage?: string) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({
      type,
      message,
      title,
      detail,
      duration = 4500,
    }: Omit<ToastItem, "id">) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const newToast: ToastItem = {
        id,
        type,
        title,
        message,
        detail,
        duration,
      };

      setToasts((prev) => [newToast, ...prev].slice(0, 5));
      return id;
    },
    [],
  );

  const success = useCallback(
    (message: string, detail?: string, duration?: number) => {
      return showToast({
        type: "success",
        title: "Thành công",
        message,
        detail,
        duration,
      });
    },
    [showToast],
  );

  const error = useCallback(
    (errorPayload: unknown, title = "Lỗi", duration?: number) => {
      const message = getApiErrorMessage(errorPayload);
      return showToast({
        type: "error",
        title,
        message,
        duration: duration ?? 6000,
      });
    },
    [showToast],
  );

  const warning = useCallback(
    (message: string, detail?: string, duration?: number) => {
      return showToast({
        type: "warning",
        title: "Cảnh báo",
        message,
        detail,
        duration,
      });
    },
    [showToast],
  );

  const info = useCallback(
    (message: string, detail?: string, duration?: number) => {
      return showToast({
        type: "info",
        title: "Thông báo",
        message,
        detail,
        duration,
      });
    },
    [showToast],
  );

  const notifyApiResponse = useCallback(
    (response: { message?: string }, fallbackMessage = "Thực hiện thành công!") => {
      const msg = response?.message?.trim() || fallbackMessage;
      return success(msg);
    },
    [success],
  );

  const contextValue = useMemo<ToastContextValue>(
    () => ({
      showToast,
      removeToast,
      success,
      error,
      warning,
      info,
      notifyApiResponse,
    }),
    [showToast, removeToast, success, error, warning, info, notifyApiResponse],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <aside
      className="toast-container"
      aria-live="polite"
      aria-label="Thông báo hệ thống"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </aside>
  );
}

interface ToastCardProps {
  toast: ToastItem;
  onRemove: (id: string) => void;
}

function ToastCard({ toast, onRemove }: ToastCardProps) {
  const duration = toast.duration ?? 4500;

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onRemove, toast.id]);

  const icons: Record<ToastType, ReactNode> = {
    success: <CheckCircle2 className="toast__icon toast__icon--success" size={20} />,
    error: <AlertCircle className="toast__icon toast__icon--error" size={20} />,
    warning: <AlertTriangle className="toast__icon toast__icon--warning" size={20} />,
    info: <Info className="toast__icon toast__icon--info" size={20} />,
  };

  return (
    <div
      className={`toast toast--${toast.type}`}
      role={toast.type === "error" ? "alert" : "status"}
    >
      <div className="toast__body">
        {icons[toast.type]}
        <div className="toast__content">
          {toast.title ? <h4 className="toast__title">{toast.title}</h4> : null}
          <p className="toast__message">{toast.message}</p>
          {toast.detail ? <p className="toast__detail">{toast.detail}</p> : null}
        </div>
        <button
          type="button"
          className="toast__close"
          onClick={() => onRemove(toast.id)}
          aria-label="Đóng thông báo"
        >
          <X size={16} />
        </button>
      </div>
      {duration > 0 ? (
        <div
          className="toast__progress"
          style={{ animationDuration: `${duration}ms` }}
        />
      ) : null}
    </div>
  );
}
