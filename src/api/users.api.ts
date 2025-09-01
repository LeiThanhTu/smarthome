import { api } from "./http";
import type { User, UserCreate, UserUpdate } from "../types";

export const UsersAPI = {
  list: () => api.get<User[]>("/users").then((r) => r.data),
  get: (id: string) => api.get<User>(`/users/${id}`).then((r) => r.data),
  create: (user: UserCreate) => api.post<User>("/users", user).then((r) => r.data),
  update: (id: string, user: UserUpdate) =>
    api.put<User>(`/users/${id}`, user).then((r) => r.data),
  delete: (id: string) => api.delete(`/users/${id}`),
  me: () => api.get<User>("/users/me").then((r) => r.data),
};
