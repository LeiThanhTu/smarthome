export type Role = "ADMIN" | "ADULT" | "CHILD";

export interface LoginRequest {
  username: string;
  password: string;
}
export interface RegisterRequest {
  username: string;
  password: string;
  role: Role;
}
export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: { id: number; username: string; role: Role };
}
