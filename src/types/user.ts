export const UserRole = {
  ADMIN: 'ADMIN',
  ADULT: 'ADULT',
  CHILD: 'CHILD'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserCreate {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}

export interface UserUpdate {
  email?: string;
  name?: string;
  role?: UserRole;
  password?: string;
}
