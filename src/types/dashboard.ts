export interface HomeOverviewData {
  message: string;
  summary?: {
    totalRooms: number;
    totalDevices: number;
  };
  rooms?: {
    id: string;
    name: string;
    description: string;
    devices: {
      id: string;
      name: string;
      type: string;
      status: "ON" | "OFF" | "OPEN" | "CLOSE" | "ACTIVE" | "INACTIVE";
    }[];
    users?: {
      id: string;
      fullName: string;
      email: string;
      role: string;
      avatar: string;
    }[];
  }[];
  recentActivity?: {
    id: string;
    type: string;
    name: string;
    action: string;
    time: string;
  }[];
}
