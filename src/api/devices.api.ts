import { api } from "./http";
import type { Device, DeviceCreate, DeviceUpdate } from "../types";

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
  deviceData: Partial<DeviceUpdate>
): Promise<Device> => {
  const response = await api.patch<Device>(`/devices/${id}`, deviceData);
  return response.data;
};

/**
 * Update device status (on/off)
 */
export const updateStatus = async (
  id: string,
  status: boolean
): Promise<Device> => {
  const response = await api.patch<Device>(`/devices/${id}/status`, { status });
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

export const devicesApi = {
  getAll,
  getById,
  create,
  update,
  updateStatus,
  delete: remove,
  getByRoom,
  getStats,
};

export default devicesApi;
