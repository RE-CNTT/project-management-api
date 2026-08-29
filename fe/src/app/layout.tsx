import type { Metadata } from "next";
import { AppLayoutShell } from "@/components/common/AppLayoutShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProjectHub - Enterprise Project Management CMS",
  description: "Hệ thống Quản lý và Điều phối Dự án Doanh nghiệp với FastAPI và Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <AppLayoutShell>{children}</AppLayoutShell>
      </body>
    </html>
  );
}
