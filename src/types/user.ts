import type { ReactNode } from "react";

export const UserRole = {
  ADMIN: "ADMIN",
  ADULT: "ADULT",
  CHILD: "CHILD",
  GUEST: "GUEST",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  name?: string; // Thay đổi từ ReactNode sang string, và làm cho nó tùy chọn
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatar?: string;
  dateOfBirth?: string | Date;
  isBlocked?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  Rooms?: { id: string; name: string }[]; // Thêm thông tin phòng
}

export interface UserCreate {
  email?: string;
  fullName?: string;
  password: string;
  role: UserRole;
  avatar?: string;
  dateOfBirth?: string | Date;
  roomIds?: string[]; // Thêm roomIds khi tạo người dùng
}

export interface UserUpdate {
  email?: string;
  fullName?: string;
  role?: UserRole;
  password?: string;
  avatar?: string;
  dateOfBirth?: string | Date;
  isBlocked?: boolean;
  roomIds?: string[]; // Thêm roomIds khi cập nhật người dùng
}
