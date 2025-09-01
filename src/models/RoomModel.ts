// src/models/RoomModel.ts
export type RoomType = 
  | 'BEDROOM' 
  | 'BATHROOM' 
  | 'KITCHEN' 
  | 'LIVING_ROOM' 
  | 'DINING_ROOM' 
  | 'OFFICE' 
  | 'GARAGE' 
  | 'OTHER';

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  description?: string;
  floor: number;
  deviceCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoomCreate {
  name: string;
  type: RoomType;
  description?: string;
  floor: number;
}

export type RoomUpdate = Partial<Omit<RoomCreate, 'id'>>;