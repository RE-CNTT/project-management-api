import type { ReactNode } from "react";

type AlertKind = "error" | "success" | "info" | "warning";

interface AlertProps {
  children: ReactNode;
  kind?: AlertKind;
  title?: string;
}

export function Alert({ children, kind = "info", title }: AlertProps) {
  return (
    <div className={`alert alert--${kind}`} role={kind === "error" ? "alert" : "status"}>
      {title ? <strong>{title}</strong> : null}
      <div>{children}</div>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="empty-state">{children}</div>;
}
