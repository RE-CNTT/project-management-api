import type { Metadata } from "next";
import { AppHeader } from "@/components/common/AppHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project API Client",
  description: "Next.js client consuming the FastAPI backend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <AppHeader />
        <main className="app-main">{children}</main>
      </body>
    </html>
  );
}
