import { api } from "./api";
import { DeviceLog } from "../types";

export const LogsAPI = {
  getDeviceLogs: (deviceId: string, params?: any) =>
    api.get<DeviceLog[]>(`/devices/${deviceId}/logs`, { params }).then((r) => r.data),
  getLogs: (params?: any) =>
    api.get<DeviceLog[]>("/logs", { params }).then((r) => r.data),
  clearLogs: () => api.delete("/logs"),
  clearDeviceLogs: (deviceId: string) =>
    api.delete(`/devices/${deviceId}/logs`),
};
