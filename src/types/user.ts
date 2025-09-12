import type { ReactNode } from "react";

export const UserRole = {
  ADMIN: "ADMIN",
  ADULT: "ADULT",
  CHILD: "CHILD",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  name: ReactNode;
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserCreate {
  email: string;
  fullName: string;
  password: string;
  role: UserRole;
}

export interface UserUpdate {
  email?: string;
  fullName?: string;
  role?: UserRole;
  password?: string;
}
