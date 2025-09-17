import { api } from "./http";
import type { Device, DeviceCreate, DeviceUpdate } from "../types/device"; // Import từ types/device.ts
import type { DeviceData } from "../types/home.types";

/**
 * Fetch all devices
 */
export const getAll = async (): Promise<Device[]> => {
  const response = await api.get<Device[]>("/devices");
  return response.data;
};

/**
 * Fetch a single device by ID
 */
export const getById = async (id: string): Promise<Device> => {
  const response = await api.get<Device>(`/devices/${id}`);
  return response.data;
};

/**
 * Create a new device
 */
export const create = async (deviceData: DeviceCreate): Promise<Device> => {
  const response = await api.post<Device>("/devices", deviceData);
  return response.data;
};

/**
 * Update a device
 */
export const update = async (
  id: string,
  deviceData: Partial<DeviceUpdate> // Sử dụng Partial<DeviceUpdate> để cho phép cập nhật một phần
): Promise<Device> => {
  const response = await api.put<Device>(`/devices/${id}`, deviceData); // Đã đổi từ patch sang put
  return response.data;
};

/**
 * Update device status (on/off, open/close, active/inactive)
 * (chỉ cập nhật status, không cần nhiều thông tin như update full device)
 */
export const updateStatus = async (
  id: string,
  status: DeviceData["status"]
): Promise<Device> => {
  const response = await api.patch<Device>(`/devices/${id}`, { status });
  return response.data;
};

/**
 * Delete a device
 */
export const remove = async (id: string): Promise<void> => {
  await api.delete(`/devices/${id}`);
};

/**
 * Get devices by room
 */
export const getByRoom = async (roomId: string): Promise<Device[]> => {
  const response = await api.get<Device[]>(`/devices/room/${roomId}`);
  return response.data;
};

/**
 * Get device statistics
 */
export const getStats = async (): Promise<{
  total: number;
  active: number;
  byType: Record<string, number>;
  byRoom: Record<string, number>;
}> => {
  const response = await api.get("/devices/stats");
  return response.data;
};

/**
 * Send a device control request
 */
export const sendDeviceRequest = async (
  deviceId: string,
  requestedStatus: DeviceData["status"]
): Promise<any> => {
  const response = await api.post("/devicerequests", {
    deviceId,
    requestedStatus,
  });
  return response.data;
};

export const devicesApi = {
  getAll,
  getById,
  create,
  update,
  updateStatus,
  delete: remove,
  getByRoom,
  getStats,
  sendDeviceRequest,
};

export default devicesApi;
