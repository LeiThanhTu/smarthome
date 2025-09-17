export interface DeviceData {
  id: string;
  name: string;
  type: string;
  status: "ON" | "OFF" | "OPEN" | "CLOSE" | "ACTIVE" | "INACTIVE";
  value?: number;
  unit?: string;
  minThreshold?: number;
  maxThreshold?: number;
  isRestricted?: boolean; // Thêm trường này
}

export interface DeviceRequestData {
  id: string;
  requesterId: string;
  deviceId: string;
  requestedStatus: "ON" | "OFF" | "OPEN" | "CLOSE" | "ACTIVE" | "INACTIVE";
  status: "PENDING" | "APPROVED" | "REJECTED";
  message?: string;
  createdAt: string;
  updatedAt: string;
  requester?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
  device?: {
    id: string;
    name: string;
    type: string;
    status: "ON" | "OFF" | "OPEN" | "CLOSE" | "ACTIVE" | "INACTIVE";
    isRestricted: boolean;
  };
}

export interface RoomMember {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "ADULT" | "CHILD" | "GUEST";
  avatar?: string;
}

export interface RoomData {
  id: string;
  name: string;
  description?: string;
  devices: DeviceData[];
  Users?: RoomMember[]; // Thành viên trong phòng
}

export interface HomeOverviewData {
  message: string;
  summary?: {
    totalRooms: number;
    totalDevices: number;
    totalUsers: number;
  };
  rooms?: RoomData[];
  recentActivity?: Array<{
    id: string;
    type: string;
    name: string;
    action: string;
    time: string;
  }>;
}
