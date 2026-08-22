"use client";

import { RequireRole } from "@/components/RequireRole";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RequireRole role="admin">
      <AdminLayout>{children}</AdminLayout>
    </RequireRole>
  );
}
