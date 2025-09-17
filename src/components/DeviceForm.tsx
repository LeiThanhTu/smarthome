import { useForm } from "react-hook-form";
import type {
  DeviceType,
  DeviceCreate,
  DeviceUpdate,
  Device,
} from "../types/device";
import type { Room } from "../types/room";
import React, { useEffect } from "react";

export type DeviceFormData = {
  name: string;
  type: DeviceType;
  roomId: string;
  description?: string;
  value?: number;
  unit?: string;
  minThreshold?: number;
  maxThreshold?: number;
};

const deviceTypes: { value: DeviceType; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "air_conditioner", label: "Air Conditioner" },
  { value: "fan", label: "Fan" },
  { value: "door", label: "Door" },
  { value: "gate", label: "Gate" },
  { value: "relay", label: "Relay" },
  { value: "keypad", label: "Keypad" },
  { value: "siren", label: "Siren" },
  { value: "led_alarm", label: "LED Alarm" },
  { value: "soil_moisture_sensor", label: "Soil Moisture Sensor" },
  { value: "pir_sensor", label: "PIR Motion Sensor" },
  { value: "gas_sensor", label: "Gas Sensor" },
  { value: "rain_sensor", label: "Rain Sensor" },
  { value: "light_sensor", label: "Light Sensor" },
  { value: "humidity_sensor", label: "Humidity Sensor" },
  { value: "temperature_sensor", label: "Temperature Sensor" },
  { value: "awning", label: "Awning" },
  { value: "other", label: "Other" },
];

interface DeviceFormProps {
  onSubmit: (data: DeviceFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  initialData?: Device;
  rooms: Room[];
}

const isSensorType = (type: DeviceType) => {
  return [
    "soil_moisture_sensor",
    "pir_sensor",
    "gas_sensor",
    "rain_sensor",
    "light_sensor",
    "humidity_sensor",
    "temperature_sensor",
  ].includes(type);
};

export const DeviceForm: React.FC<DeviceFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting,
  initialData,
  rooms,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<DeviceFormData>({
    defaultValues: initialData
      ? {
          name: initialData.name,
          type: initialData.type,
          roomId: initialData.roomId,
          description: initialData.description,
          value: initialData.value,
          unit: initialData.unit,
          minThreshold: initialData.minThreshold,
          maxThreshold: initialData.maxThreshold,
        }
      : {
          type: "light",
          roomId: rooms[0]?.id || "",
        },
  });

  const selectedType = watch("type");

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        type: initialData.type,
        roomId: initialData.roomId,
        description: initialData.description,
        value: initialData.value,
        unit: initialData.unit,
        minThreshold: initialData.minThreshold,
        maxThreshold: initialData.maxThreshold,
      });
    } else {
      reset({
        type: "light",
        roomId: rooms[0]?.id || "",
        name: "",
        description: "",
        value: undefined,
        unit: "",
        minThreshold: undefined,
        maxThreshold: undefined,
      });
    }
  }, [initialData, rooms, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Device Name
        </label>
        <input
          type="text"
          id="name"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          {...register("name", { required: "Device name is required" })}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-gray-700"
        >
          Device Type
        </label>
        <select
          id="type"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          {...register("type", { required: "Device type is required" })}
        >
          {deviceTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {errors.type && (
          <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
        )}
      </div>

      {isSensorType(selectedType) && (
        <>
          <div>
            <label
              htmlFor="value"
              className="block text-sm font-medium text-gray-700"
            >
              Current Value (Optional)
            </label>
            <input
              type="number"
              id="value"
              step="any"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              {...register("value", { valueAsNumber: true })}
            />
          </div>
          <div>
            <label
              htmlFor="unit"
              className="block text-sm font-medium text-gray-700"
            >
              Unit (e.g., %, °C, lux) (Optional)
            </label>
            <input
              type="text"
              id="unit"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              {...register("unit")}
            />
          </div>
          <div>
            <label
              htmlFor="minThreshold"
              className="block text-sm font-medium text-gray-700"
            >
              Min Threshold (Optional)
            </label>
            <input
              type="number"
              id="minThreshold"
              step="any"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              {...register("minThreshold", { valueAsNumber: true })}
            />
          </div>
          <div>
            <label
              htmlFor="maxThreshold"
              className="block text-sm font-medium text-gray-700"
            >
              Max Threshold (Optional)
            </label>
            <input
              type="number"
              id="maxThreshold"
              step="any"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              {...register("maxThreshold", { valueAsNumber: true })}
            />
          </div>
        </>
      )}

      <div>
        <label
          htmlFor="roomId"
          className="block text-sm font-medium text-gray-700"
        >
          Room
        </label>
        <select
          id="roomId"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          {...register("roomId", { required: "Room is required" })}
        >
          <option value="" disabled>
            Select a room
          </option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
        {errors.roomId && (
          <p className="mt-1 text-sm text-red-600">{errors.roomId.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description (Optional)
        </label>
        <textarea
          id="description"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          {...register("description")}
        />
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : initialData
            ? "Save Changes"
            : "Add Device"}
        </button>
      </div>
    </form>
  );
};

export default DeviceForm;
