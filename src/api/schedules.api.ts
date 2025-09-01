import { api } from "./http";
import type { Schedule, ScheduleCreate, ScheduleUpdate } from "../types";

export const SchedulesAPI = {
  list: () => api.get<Schedule[]>("/schedules").then((r) => r.data),
  get: (id: number) => api.get<Schedule>(`/schedules/${id}`).then((r) => r.data),
  create: (data: ScheduleCreate) => api.post<Schedule>("/schedules", data).then((r) => r.data),
  update: (id: number, data: ScheduleUpdate) => 
    api.put<Schedule>(`/schedules/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/schedules/${id}`),
};
