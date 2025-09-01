/**
 * Base device type that represents common properties of all devices
 */
export type DeviceType = 
  | 'light' 
  | 'thermostat' 
  | 'tv' 
  | 'ac' 
  | 'speaker' 
  | 'camera' 
  | 'sensor' 
  | 'switch' 
  | 'outlet' 
  | 'other';

/**
 * Base device interface with common properties
 */
export interface BaseDevice {
  id: string;
  name: string;
  type: DeviceType;
  status: boolean;
  roomId: string;
  description?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  lastActive?: string | Date;
  metadata?: Record<string, any>;
}

/**
 * Light device specific properties
 */
export interface LightDevice extends BaseDevice {
  type: 'light';
  brightness?: number; // 0-100
  color?: string; // HEX color code
  colorTemperature?: number; // in Kelvin
}

/**
 * Thermostat device specific properties
 */
export interface ThermostatDevice extends BaseDevice {
  type: 'thermostat';
  currentTemperature: number;
  targetTemperature: number;
  mode: 'heat' | 'cool' | 'auto' | 'off';
  humidity?: number;
}

/**
 * TV device specific properties
 */
export interface TVDevice extends BaseDevice {
  type: 'tv';
  channel?: number;
  volume?: number; // 0-100
  inputSource?: string;
  isMuted?: boolean;
}

/**
 * Air Conditioner device specific properties
 */
export interface ACDevice extends BaseDevice {
  type: 'ac';
  currentTemperature: number;
  targetTemperature: number;
  mode: 'cool' | 'heat' | 'fan' | 'dry' | 'auto';
  fanSpeed: 'low' | 'medium' | 'high' | 'auto';
  swing: boolean;
}

/**
 * Speaker device specific properties
 */
export interface SpeakerDevice extends BaseDevice {
  type: 'speaker';
  volume: number; // 0-100
  isMuted: boolean;
  currentTrack?: string;
  artist?: string;
  albumArt?: string;
  isPlaying: boolean;
}

/**
 * Camera device specific properties
 */
export interface CameraDevice extends BaseDevice {
  type: 'camera';
  isStreaming: boolean;
  isRecording: boolean;
  hasMotion: boolean;
  lastMotionDetected?: string | Date;
  streamUrl?: string;
}

/**
 * Sensor device specific properties
 */
export interface SensorDevice extends BaseDevice {
  type: 'sensor';
  value: number;
  unit: string;
  sensorType: 'temperature' | 'humidity' | 'motion' | 'door' | 'window' | 'smoke' | 'water' | 'co2' | 'vibration';
  batteryLevel?: number;
  lastTriggered?: string | Date;
}

/**
 * Switch device specific properties
 */
export interface SwitchDevice extends BaseDevice {
  type: 'switch';
  power?: number; // in watts
  energyUsage?: number; // in watt-hours
  voltage?: number; // in volts
  current?: number; // in amps
}

/**
 * Union type of all possible device types
 */
export type Device = 
  | LightDevice
  | ThermostatDevice
  | TVDevice
  | ACDevice
  | SpeakerDevice
  | CameraDevice
  | SensorDevice
  | SwitchDevice;

/**
 * Type for creating a new device
 */
export interface DeviceCreate {
  name: string;
  type: DeviceType;
  roomId: string;
  description?: string;
  status?: boolean;
  metadata?: Record<string, any>;
  // Device-specific properties
  [key: string]: any;
}

/**
 * Type for updating a device
 */
export type DeviceUpdate = Partial<Omit<DeviceCreate, 'id' | 'type'>>;

/**
 * Type for device status update
 */
export interface DeviceStatusUpdate {
  status: boolean;
  updatedAt: string | Date;
}

/**
 * Type for device statistics
 */
export interface DeviceStats {
  total: number;
  active: number;
  byType: Record<DeviceType, number>;
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
  type: 'boolean' | 'number' | 'string' | 'object';
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
