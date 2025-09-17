/**
 * Base device type that represents common properties of all devices
 */
export type DeviceType =
  | "light"
  | "air_conditioner"
  | "fan"
  | "door"
  | "gate"
  | "relay"
  | "keypad"
  | "siren"
  | "led_alarm"
  | "soil_moisture_sensor"
  | "pir_sensor"
  | "gas_sensor"
  | "rain_sensor"
  | "light_sensor"
  | "humidity_sensor"
  | "temperature_sensor"
  | "awning"
  | "other";

/**
 * Base device interface with common properties
 */
export interface BaseDevice {
  id: string;
  name: string;
  type: DeviceType;
  status: "ON" | "OFF" | "OPEN" | "CLOSE" | "ACTIVE" | "INACTIVE";
  roomId: string;
  description?: string;
  value?: number;
  unit?: string;
  minThreshold?: number;
  maxThreshold?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  lastActive?: string | Date;
  metadata?: Record<string, any>;
  isRestricted?: boolean; // Thêm trường isRestricted
  Room?: {
    // Add Room details
    name: string;
    Users?: {
      // Add Users in the room
      fullName: string;
    }[];
  };
}

// Các interface thiết bị cụ thể đã được loại bỏ để sử dụng BaseDevice generic hơn

export type Device = BaseDevice;

/**
 * Type for creating a new device
 */
export interface DeviceCreate {
  name: string;
  type: DeviceType;
  roomId: string;
  description?: string;
  status?: "ON" | "OFF" | "OPEN" | "CLOSE" | "ACTIVE" | "INACTIVE";
  value?: number;
  unit?: string;
  minThreshold?: number;
  maxThreshold?: number;
}

/**
 * Type for updating a device
 */
export interface DeviceUpdate {
  name?: string;
  type?: DeviceType;
  roomId?: string;
  description?: string;
  status?: "ON" | "OFF" | "OPEN" | "CLOSE" | "ACTIVE" | "INACTIVE";
  value?: number;
  unit?: string;
  minThreshold?: number;
  maxThreshold?: number;
  isRestricted?: boolean; // Thêm trường isRestricted
}

/**
 * Type for device statistics
 */
export interface DeviceStats {
  total: number;
  active: number;
  byType: Record<string, number>;
  byRoom: Record<string, number>;
  lastUpdated: string | Date;
}

/**
 * Type for device activity log
 */
export interface DeviceActivity {
  id: string;
  deviceId: string;
  action: string;
  value?: any;
  timestamp: string | Date;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Type for device state history
 */
export interface DeviceStateHistory {
  timestamp: string | Date;
  state: Record<string, any>;
}

/**
 * Type for device capability
 */
export interface DeviceCapability {
  name: string;
  type: "boolean" | "number" | "string" | "object";
  readable: boolean;
  writable: boolean;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  values?: any[];
  description?: string;
}

/**
 * Type for device discovery
 */
export interface DiscoveredDevice {
  id: string;
  name: string;
  type: DeviceType;
  manufacturer: string;
  model: string;
  ipAddress: string;
  macAddress: string;
  firmwareVersion: string;
  isPaired: boolean;
  lastSeen: string | Date;
  capabilities: DeviceCapability[];
}
