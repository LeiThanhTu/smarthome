import { type DeviceData, type RoomMember } from "./home.types";

export type RoomType =
  | "LIVING_ROOM"
  | "BEDROOM"
  | "KITCHEN"
  | "BATHROOM"
  | "DINING_ROOM"
  | "HOME_OFFICE"
  | "GARAGE"
  | "GARDEN"
  | "DRYING_YARD"
  | "TERRACE"
  | "STORAGE"
  | "OTHER";

export interface Room {
  id: string;
  name: string;
  description?: string;
  type: RoomType;
  // floor: number; // loại bỏ floor vì không cần thiết cho backend mới
  devices?: DeviceData[];
  Users?: RoomMember[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RoomCreate {
  name: string;
  description?: string;
  // type?: RoomType; // không cần type ở đây, sẽ được xác định ở frontend hoặc default
  // floor?: number; // không cần floor ở đây
  memberIds?: string[];
}

export interface RoomUpdate {
  name?: string;
  description?: string;
  // type?: RoomType;
  // floor?: number;
  memberIds?: string[];
}
