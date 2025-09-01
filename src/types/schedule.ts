export interface Schedule {
  id: number;
  deviceId: number;
  userId?: number;
  cron?: string;
  at?: string; // ISO time for one-off
  action: "ON" | "OFF" | "TOGGLE";
  enabled: boolean;
  name?: string;
}

export interface ScheduleCreate {
  deviceId: number;
  action: "ON" | "OFF" | "TOGGLE";
  at?: string;
  cron?: string;
  name?: string;
  enabled?: boolean;
}

export interface ScheduleUpdate extends Partial<ScheduleCreate> {
  enabled?: boolean;
}
