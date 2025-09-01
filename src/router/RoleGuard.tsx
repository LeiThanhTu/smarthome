import React, { type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import type { Role } from "../types";

export default function RoleGuard({
  allow,
  children,
}: {
  allow: Role[];
  children: ReactNode;
}) {
  const { user } = useAuth();
  if (!user) return null;
  return allow.includes(user.role as Role) ? (
    <>{children}</>
  ) : (
    <div className="p-6 bg-white rounded shadow">
      ⛔ Bạn không có quyền truy cập
    </div>
  );
}
