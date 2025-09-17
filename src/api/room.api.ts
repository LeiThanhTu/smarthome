// src/api/room.api.ts
import type { Room, RoomCreate, RoomUpdate, RoomType } from "../types/room"; // Import từ types/room.ts mới
import { api } from "./http";

// Đã loại bỏ mock data vì sẽ gọi API backend

export const ROOM_TYPE_OPTIONS = [
  { value: "LIVING_ROOM", label: "Living Room" },
  { value: "BEDROOM", label: "Bedroom" },
  { value: "KITCHEN", label: "Kitchen" },
  { value: "BATHROOM", label: "Bathroom" },
  { value: "DINING_ROOM", label: "Dining Room" },
  { value: "HOME_OFFICE", label: "Home Office" },
  { value: "GARAGE", label: "Garage" },
  { value: "GARDEN", label: "Garden" },
  { value: "DRYING_YARD", label: "Drying Yard" },
  { value: "TERRACE", label: "Terrace" },
  { value: "STORAGE", label: "Storage" },
  { value: "OTHER", label: "Other" },
] as const;

// Đã loại bỏ simulateApiDelay vì sẽ gọi API backend

export const getAll = async (): Promise<Room[]> => {
  const response = await api.get<Room[]>("/rooms");
  return response.data;
};

export const getById = async (id: string): Promise<Room> => {
  const response = await api.get<Room>(`/rooms/${id}`);
  return response.data;
};

export const create = async (roomData: RoomCreate): Promise<Room> => {
  const response = await api.post<Room>("/rooms", roomData);
  return response.data;
};

export const update = async (
  id: string,
  roomData: Partial<RoomUpdate>
): Promise<Room> => {
  const response = await api.put<Room>(`/rooms/${id}`, roomData);
  return response.data;
};

export const remove = async (id: string): Promise<void> => {
  await api.delete(`/rooms/${id}`);
};

export const addMembers = async (
  roomId: string,
  memberIds: string[]
): Promise<void> => {
  await api.post(`/rooms/${roomId}/members`, { memberIds });
};

export const removeMember = async (
  roomId: string,
  userId: string
): Promise<void> => {
  await api.delete(`/rooms/${roomId}/members/${userId}`);
};

const RoomAPI = {
  getAll,
  getById,
  create,
  update,
  delete: remove,
  addMembers,
  removeMember,
};

export { RoomAPI };
export type { Room, RoomCreate, RoomUpdate, RoomType };
