import { api } from "./http";
import type { User, UserCreate, UserUpdate } from "../types";
import type { HomeOverviewData } from "../types";

export const UsersAPI = {
  list: () => api.get<User[]>("/users").then((r) => r.data),
  get: (id: string) => api.get<User>(`/users/${id}`).then((r) => r.data),
  create: (
    user: UserCreate | FormData,
    config?: { headers: { "Content-Type": string } }
  ) => api.post<User>("/users", user, config).then((r) => r.data),
  update: (
    id: string,
    user: UserUpdate | FormData,
    config?: { headers: { "Content-Type": string } }
  ) => api.put<User>(`/users/${id}`, user, config).then((r) => r.data),
  delete: (id: string) => api.delete(`/users/${id}`),
  getProfile: () => api.get<User>("/users/profile").then((r) => r.data),
  updateProfile: (
    user: UserUpdate | FormData,
    config?: { headers: { "Content-Type": string } }
  ) => api.put<User>("/users/profile", user, config).then((r) => r.data),
  getHomeOverview: () =>
    api.get<HomeOverviewData>("/users/home").then((r) => r.data),
};
