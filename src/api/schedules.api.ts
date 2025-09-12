import { api } from "./http";
import type { Schedule, ScheduleCreate, ScheduleUpdate } from "../types";

export const SchedulesAPI = {
  list: () => api.get<Schedule[]>("/admin/schedules").then((r) => r.data),
  get: (id: number) =>
    api.get<Schedule>(`/admin/schedules/${id}`).then((r) => r.data),
  create: (data: ScheduleCreate) =>
    api.post<Schedule>("/admin/schedules", data).then((r) => r.data),
  update: (id: number, data: ScheduleUpdate) =>
    api.put<Schedule>(`/admin/schedules/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/admin/schedules/${id}`),
};
