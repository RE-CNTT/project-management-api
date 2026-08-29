import type { ReactNode } from "react";
import { AlertCircle, AlertTriangle, CheckCircle, Info, Inbox } from "lucide-react";

export type AlertKind = "info" | "success" | "warning" | "error";

export interface AlertProps {
  kind?: AlertKind;
  title?: string;
  children: ReactNode;
  action?: ReactNode;
}

export function Alert({
  kind = "info",
  title,
  children,
  action,
}: AlertProps) {
  const icons = {
    info: <Info className="alert-icon alert-icon--info" size={18} />,
    success: <CheckCircle className="alert-icon alert-icon--success" size={18} />,
    warning: <AlertTriangle className="alert-icon alert-icon--warning" size={18} />,
    error: <AlertCircle className="alert-icon alert-icon--error" size={18} />,
  };

  return (
    <div className={`alert-box alert-box--${kind}`} role="alert">
      <div className="alert-box__content-wrap">
        {icons[kind]}
        <div className="alert-box__text">
          {title ? <h4 className="alert-box__title">{title}</h4> : null}
          <div className="alert-box__body">{children}</div>
        </div>
      </div>
      {action ? <div className="alert-box__action">{action}</div> : null}
    </div>
  );
}

export interface BadgeProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "neutral";
  size?: "sm" | "md";
  dot?: boolean;
}

export function Badge({
  children,
  variant = "neutral",
  size = "md",
  dot = false,
}: BadgeProps) {
  return (
    <span className={`status-badge status-badge--${variant} status-badge--${size}`}>
      {dot ? <span className="status-badge__dot" /> : null}
      {children}
    </span>
  );
}

export interface SkeletonProps {
  height?: number | string;
  width?: number | string;
  rounded?: "sm" | "md" | "lg" | "full";
  className?: string;
}

export function Skeleton({
  height = "20px",
  width = "100%",
  rounded = "md",
  className = "",
}: SkeletonProps) {
  return (
    <div
      className={`skeleton-box skeleton-box--rounded-${rounded} ${className}`.trim()}
      style={{ height, width }}
    />
  );
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        {icon ?? <Inbox size={48} strokeWidth={1.2} />}
      </div>
      <h3 className="empty-state__title">{title}</h3>
      {description ? (
        <p className="empty-state__description">{description}</p>
      ) : null}
      {action ? <div className="empty-state__action">{action}</div> : null}
    </div>
  );
}
