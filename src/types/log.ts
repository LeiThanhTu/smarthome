export interface DeviceLog {
  id: number;
  deviceId: number;
  userId?: number;
  action: string;
  timestamp: string; // ISO
  meta?: Record<string, any>;
}
