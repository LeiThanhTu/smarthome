export type SensorType = 'TEMP' | 'HUMID' | 'LIGHT' | 'MOTION' | 'OTHER'

export interface Sensor {
  id: number
  name: string
  roomId: number
  type: SensorType
  value?: number
  unit?: string
  thresholdLow?: number
  thresholdHigh?: number
}
