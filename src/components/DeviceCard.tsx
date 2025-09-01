import { useState } from "react";
import type { DeviceType } from "../types";
import { Switch } from "@headlessui/react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

// Sử dụng DeviceType từ types/device.ts

interface DeviceCardProps {
  id: string;
  name: string;
  type: DeviceType;
  status: boolean;
  room: string;
  lastUpdated?: string;
  onToggle?: (id: string, newStatus: boolean) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  disabled?: boolean;
}

const deviceIcons: Record<DeviceType, string> = {
  light: "💡",
  thermostat: "🌡️",
  tv: "📺",
  ac: "❄️",
  speaker: "🔊",
  camera: "📷",
  sensor: "🛰️",
  switch: "🔀",
  outlet: "🔌",
  other: "🔌",
};

export default function DeviceCard({
  id,
  name,
  type,
  status,
  room,
  lastUpdated,
  onToggle,
  onEdit,
  onDelete,
  showActions = true,
  disabled = false,
}: DeviceCardProps) {
  const [isEnabled, setIsEnabled] = useState(status);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (disabled) return;
    const newStatus = !isEnabled;
    setIsEnabled(newStatus);
    if (onToggle) {
      try {
        setIsLoading(true);
        await onToggle(id, newStatus);
      } catch (error) {
        setIsEnabled(!newStatus);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-indigo-100 p-3 rounded-lg">
            <span className="text-2xl">
              {deviceIcons[type] || deviceIcons.other}
            </span>
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">{name}</h3>
              <div className="flex-shrink-0 ml-2">
                <Switch
                  checked={isEnabled}
                  onChange={handleToggle}
                  disabled={isLoading || disabled}
                  className={`$
                    isEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    disabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <span className="sr-only">Toggle {name}</span>
                  <span
                    className={`${
                      isEnabled ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>
            </div>
            <p className="text-sm text-gray-500">{room}</p>
            {lastUpdated && (
              <p className="text-xs text-gray-400 mt-1">
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
      {showActions && (onEdit || onDelete) && (
        <div className="bg-gray-50 px-5 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isEnabled
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {isEnabled ? "Online" : "Offline"}
            </span>
            <Switch
              checked={isEnabled}
              onChange={handleToggle}
              className={`${isEnabled ? "bg-green-500" : "bg-gray-300"}
                relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none`}
              disabled={disabled || isLoading}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  isEnabled ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </Switch>
          </div>
          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(id)}
                className="text-gray-400 hover:text-indigo-600 focus:outline-none"
                title="Edit device"
              >
                <PencilIcon className="h-5 w-5" />
                <span className="sr-only">Edit {name}</span>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(id)}
                className="text-gray-400 hover:text-red-600 focus:outline-none"
                title="Delete device"
              >
                <TrashIcon className="h-5 w-5" />
                <span className="sr-only">Delete {name}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
