export type Role = "ADMIN" | "ADULT" | "CHILD" | "GUEST";

export interface LoginRequest {
  username: string;
  password: string;
}
export interface RegisterRequest {
  username: string;
  password: string;
}
export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: number;
    fullName: string;
    email: string;
    role: Role;
    avatar?: string;
    dateOfBirth?: string;
    isBlocked?: boolean;
  };
}
