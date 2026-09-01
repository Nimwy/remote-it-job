"use client";

import { RequireRole } from "@/components/RequireRole";

export default function HrLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RequireRole role="hr">{children}</RequireRole>;
}
