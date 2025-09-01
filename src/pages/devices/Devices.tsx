import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import DeviceCard from "../../components/DeviceCard";
import { useAuth } from "../../store/auth.store";
import Modal, { ModalFooter } from "../../components/Modal";
import { Button } from "../../components/Button";
import type { Device, DeviceType } from "../../types";
import * as devicesApi from "../../api/devices.api";

type DeviceFormData = {
  name: string;
  type: DeviceType;
  roomId: string;
  description?: string;
};

const deviceTypes: { value: DeviceType; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "thermostat", label: "Thermostat" },
  { value: "tv", label: "TV" },
  { value: "ac", label: "Air Conditioner" },
  { value: "speaker", label: "Speaker" },
  { value: "camera", label: "Camera" },
  { value: "other", label: "Other" },
];

// Mock rooms - replace with actual API call
const mockRooms = [
  { id: "1", name: "Living Room" },
  { id: "2", name: "Kitchen" },
  { id: "3", name: "Bedroom" },
];

export default function Devices() {
  const { isAdmin, isAdult, isChild } = useAuth();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<DeviceType | "all">("all");
  const [roomFilter, setRoomFilter] = useState<string>("all");

  // Fetch devices
  const {
    data: devicesRaw = [],
    isLoading,
    error,
  } = useQuery<Device[]>({
    queryKey: ["devices"],
    queryFn: async () => {
      let data = await devicesApi.getAll();
      if (!Array.isArray(data) || data.length === 0) {
        // Mock data if API returns empty
        data = [
          {
            id: "1",
            name: "Living Room Light",
            type: "light",
            roomId: "1",
            status: true,
            description: "Ceiling light",
          },
          {
            id: "2",
            name: "Kitchen AC",
            type: "ac",
            roomId: "2",
            status: false,
            description: "Air conditioner",
          },
          {
            id: "3",
            name: "Bedroom TV",
            type: "tv",
            roomId: "3",
            status: true,
            description: "Smart TV",
          },
        ];
      }
      return data;
    },
  });
  const devices = Array.isArray(devicesRaw) ? devicesRaw : [];

  // Mutations
  const addDeviceMutation = useMutation({
    mutationFn: devicesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      toast.success("Device added successfully");
      setIsAddModalOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add device");
    },
  });

  const updateDeviceStatus = async (deviceId: string, status: boolean) => {
    try {
      await devicesApi.updateStatus(deviceId, status);
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to update device status");
      throw error; // Re-throw to allow DeviceCard to handle the error
    }
  };

  const deleteDevice = async (deviceId: string) => {
    if (window.confirm("Are you sure you want to delete this device?")) {
      try {
        await devicesApi.remove(deviceId);
        queryClient.invalidateQueries({ queryKey: ["devices"] });
        toast.success("Device deleted successfully");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete device");
      }
    }
  };

  // Form handling
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeviceFormData>({
    defaultValues: {
      type: "light",
      roomId: mockRooms[0]?.id || "",
    },
  });

  const onSubmit = (data: DeviceFormData) => {
    addDeviceMutation.mutate({
      ...data,
      status: false, // Default to off
    });
  };

  // Filter devices (ensure devices is always an array)
  const filteredDevices = Array.isArray(devices)
    ? devices.filter((device) => {
        const matchesSearch = device.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === "all" || device.type === typeFilter;
        const matchesRoom =
          roomFilter === "all" || device.roomId === roomFilter;

        return matchesSearch && matchesType && matchesRoom;
      })
    : [];

  if (isLoading) {
    return <div>Loading devices...</div>;
  }

  if (error) {
    return <div>Error loading devices</div>;
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Devices</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your smart home devices
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={() => setIsAddModalOpen(true)}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Device
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <input
                type="text"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border"
                placeholder="Search devices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as DeviceType | "all")
              }
              className="min-w-[120px] rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="all">All Types</option>
              {deviceTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="min-w-[140px] rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="all">All Rooms</option>
              {mockRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Devices Grid */}
      {filteredDevices.length === 0 ? (
        <div className="text-center py-12 bg-white shadow rounded-lg">
          <p className="text-gray-500">No devices found</p>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4"
            variant="outline"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add your first device
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDevices.map((device) => {
            // Quy tắc: ADMIN, ADULT điều khiển mọi thiết bị; CHILD chỉ điều khiển thiết bị cho phép
            let canControl = false;
            if (isAdmin || isAdult) {
              canControl = true;
            } else if (isChild) {
              // Ví dụ: chỉ cho phép CHILD điều khiển thiết bị type 'light' và 'tv'
              const allowedTypes = ["light", "tv"];
              canControl = allowedTypes.includes(device.type);
            }
            return (
              <DeviceCard
                key={device.id}
                id={device.id}
                name={device.name}
                type={device.type as DeviceType}
                status={device.status}
                room={
                  mockRooms.find((r) => r.id === device.roomId)?.name ||
                  "Unknown"
                }
                lastUpdated={
                  typeof device.updatedAt === "string"
                    ? device.updatedAt
                    : device.updatedAt?.toString()
                }
                onToggle={canControl ? updateDeviceStatus : undefined}
                onDelete={canControl ? deleteDevice : undefined}
                disabled={!canControl}
              />
            );
          })}
        </div>
      )}

      {/* Add Device Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Device"
        description="Fill in the details to add a new smart device to your home."
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
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
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
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
            </div>

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
                {mockRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
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
          </div>

          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddModalOpen(false)}
              disabled={addDeviceMutation.status === "pending"}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addDeviceMutation.status === "pending"}
            >
              {addDeviceMutation.status === "pending"
                ? "Adding..."
                : "Add Device"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
