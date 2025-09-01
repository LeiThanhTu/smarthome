// src/api/room.api.ts
import type {
  Room,
  RoomCreate,
  RoomType,
  RoomUpdate,
} from "../models/RoomModel";

// Mock data
let mockRooms: Room[] = [
  {
    id: "1",
    name: "Living Room",
    type: "LIVING_ROOM",
    description: "Main living area",
    floor: 1,
    deviceCount: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Master Bedroom",
    type: "BEDROOM",
    description: "Main bedroom",
    floor: 2,
    deviceCount: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Kitchen",
    type: "KITCHEN",
    description: "Main kitchen area",
    floor: 1,
    deviceCount: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const ROOM_TYPE_OPTIONS = [
  { value: "LIVING_ROOM", label: "Living Room" },
  { value: "BEDROOM", label: "Bedroom" },
  { value: "KITCHEN", label: "Kitchen" },
  { value: "BATHROOM", label: "Bathroom" },
  { value: "DINING_ROOM", label: "Dining Room" },
  { value: "HOME_OFFICE", label: "Home Office" },
  { value: "GARAGE", label: "Garage" },
  { value: "OTHER", label: "Other" },
] as const;

// Simulate API delay
const simulateApiDelay = () =>
  new Promise((resolve) => setTimeout(resolve, 300));

export const getAll = async (): Promise<Room[]> => {
  await simulateApiDelay();
  return [...mockRooms];
};

export const getById = async (id: string): Promise<Room> => {
  await simulateApiDelay();
  const room = mockRooms.find((room) => room.id === id);
  if (!room) throw new Error("Room not found");
  return { ...room };
};

export const create = async (roomData: RoomCreate): Promise<Room> => {
  await simulateApiDelay();
  const newRoom: Room = {
    ...roomData,
    id: Math.random().toString(36).substr(2, 9),
    deviceCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockRooms = [...mockRooms, newRoom];
  return newRoom;
};

export const update = async (
  id: string,
  roomData: Partial<RoomUpdate>
): Promise<Room> => {
  await simulateApiDelay();
  const index = mockRooms.findIndex((room) => room.id === id);
  if (index === -1) throw new Error("Room not found");

  const updatedRoom = {
    ...mockRooms[index],
    ...roomData,
    updatedAt: new Date().toISOString(),
  };

  mockRooms = [
    ...mockRooms.slice(0, index),
    updatedRoom,
    ...mockRooms.slice(index + 1),
  ];

  return updatedRoom;
};

export const remove = async (id: string): Promise<void> => {
  await simulateApiDelay();
  mockRooms = mockRooms.filter((room) => room.id !== id);
};

const RoomAPI = {
  getAll,
  getById,
  create,
  update,
  delete: remove,
};

export { RoomAPI };
export type { Room, RoomCreate, RoomUpdate, RoomType };
