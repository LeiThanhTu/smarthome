import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import React, { useEffect } from "react"; // Import React và useEffect
import { Switch } from "@headlessui/react"; // Import Switch
import { api } from "../../api/http"; // Import api
import { useSocket } from "../../context/SocketContext"; // Import useSocket
import { useAuthStore } from "../../store/auth.store"; // Import useAuthStore
import type { HomeOverviewData } from "../../types/dashboard"; // Import HomeOverviewData dưới dạng type
import { type RoomData, type DeviceData } from "../../types/home.types"; // Import RoomData, DeviceData dưới dạng type
import {
  Lightbulb,
  Thermometer,
  Droplet,
  Sun,
  DoorOpen,
  Siren,
  Fan,
  Power,
} from "lucide-react"; // Import các icon

// import DeviceCard from "../../components/DeviceCard"; // Loại bỏ DeviceCard
import Modal from "../../components/Modal";
import { Button } from "../../components/Button";
import type {
  Device,
  DeviceType,
  DeviceCreate,
  DeviceUpdate,
} from "../../types/device";
import type { Room } from "../../types/room";
import * as devicesApi from "../../api/devices.api";
import * as roomsApi from "../../api/room.api";
import { DeviceForm, type DeviceFormData } from "../../components/DeviceForm";
import { Input } from "../../components/Input"; // Added Input import
import { useMemo } from "react"; // Import useMemo

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

export default function Devices() {
  const { user: currentUser } = useAuthStore(); // Lấy user từ hook useAuthStore
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<DeviceType | "all">("all");
  const [roomFilter, setRoomFilter] = useState<string>("all");
  const [editingDevice, setEditingDevice] = useState<Device | undefined>(
    undefined
  );
  const [pendingRequests, setPendingRequests] = useState<{
    [key: string]: "PENDING" | "APPROVED" | "REJECTED";
  }>({}); // Lưu trữ trạng thái yêu cầu của thiết bị
  const [isRequestConfirmModalOpen, setIsRequestConfirmModalOpen] =
    useState(false);
  const [deviceToConfirmRequest, setDeviceToConfirmRequest] = useState<
    Device | undefined
  >(undefined);
  const [nextStatusToRequest, setNextStatusToRequest] = useState<
    "ON" | "OFF" | "OPEN" | "CLOSE" | "ACTIVE" | "INACTIVE" | undefined
  >(undefined);

  // Fetch rooms
  const { data: rooms = [] } = useQuery<Room[]>({
    queryKey: ["rooms"],
    queryFn: roomsApi.getAll,
  });

  // Fetch dashboard data for allowed devices
  const { data: dashboardData } = useQuery<HomeOverviewData>({
    queryKey: ["dashboard", currentUser?.id],
    queryFn: async () => {
      const response = await api.get("/users/home");
      return response.data as HomeOverviewData;
    },
    enabled:
      !!currentUser?.id && ["ADULT", "CHILD"].includes(currentUser.role as any),
    staleTime: 5 * 60 * 1000,
  });

  const dashboardDeviceIds = useMemo(() => {
    if (!dashboardData?.rooms) return new Set<string>();
    const ids = new Set<string>();
    dashboardData.rooms.forEach((room: RoomData) => {
      room.devices.forEach((device: DeviceData) => {
        ids.add(device.id);
      });
    });
    return ids;
  }, [dashboardData]);

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
        // data = [
        //   {
        //     id: "1",
        //     name: "Living Room Light",
        //     type: "light",
        //     roomId: "1",
        //     status: true,
        //     description: "Ceiling light",
        //   },
        //   {
        //     id: "2",
        //     name: "Kitchen AC",
        //     type: "ac",
        //     roomId: "2",
        //     status: false,
        //     description: "Air conditioner",
        //   },
        //   {
        //     id: "3",
        //     name: "Bedroom TV",
        //     type: "tv",
        //     roomId: "3",
        //     status: true,
        //     description: "Smart TV",
        //   },
        // ];
      }
      return data;
    },
  });
  const devices = Array.isArray(devicesRaw) ? devicesRaw : [];

  // Mutations
  const addDeviceMutation = useMutation({
    mutationFn: (newDevice: DeviceCreate) => devicesApi.create(newDevice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      toast.success("Device added successfully");
      setIsAddModalOpen(false);
      // reset(); // No direct use of useForm in Devices.tsx, form logic is in DeviceForm.tsx
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add device");
    },
  });

  const updateDeviceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DeviceUpdate }) =>
      devicesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      toast.success("Device updated successfully");
      setIsEditModalOpen(false);
      setEditingDevice(undefined);
      // reset(); // No direct use of useForm in Devices.tsx, form logic is in DeviceForm.tsx
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update device");
    },
  });

  const handleRequestControl = async (
    deviceId: string,
    requestedStatus: "ON" | "OFF" | "OPEN" | "CLOSE" | "ACTIVE" | "INACTIVE"
  ) => {
    try {
      const response = await devicesApi.sendDeviceRequest(
        deviceId,
        requestedStatus
      );
      // sendDeviceRequest returns response.data, so message is at response.message
      toast.success(response?.message || "Gửi yêu cầu điều khiển thành công");
      setPendingRequests((prev) => ({ ...prev, [deviceId]: "PENDING" })); // Đặt trạng thái yêu cầu là PENDING
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    } catch (error: any) {
      toast.error(
        `Không thể gửi yêu cầu điều khiển: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleDeviceToggle = async (
    deviceId: string,
    currentStatus: string,
    deviceType: string
  ) => {
    let newStatus: "ON" | "OFF" | "OPEN" | "CLOSE" | "ACTIVE" | "INACTIVE";
    if (deviceType === "door" || deviceType === "gate") {
      newStatus = currentStatus === "OPEN" ? "CLOSE" : "OPEN";
    } else if (deviceType.includes("sensor")) {
      newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    } else {
      newStatus = currentStatus === "ON" ? "OFF" : "ON";
    }

    // Kiểm tra quyền: ADMIN được điều khiển trực tiếp
    if (currentUser?.role === "ADMIN") {
      try {
        await devicesApi.updateStatus(deviceId, newStatus);
        toast.success(
          `Thiết bị ${deviceId} đã chuyển trạng thái thành ${newStatus.toLowerCase()} thành công!`
        );
        queryClient.invalidateQueries({ queryKey: ["devices"] });
      } catch (error: any) {
        toast.error(
          `Không thể chuyển trạng thái thiết bị ${deviceId} thành ${currentStatus.toLowerCase()}: ${
            error.message
          }`
        );
      }
    } else {
      // Đối với GUEST, CHILD, ADULT hoặc thiết bị hạn chế, luôn cần yêu cầu hoặc xác nhận
      const currentDevice = devices.find((d) => d.id === deviceId);
      if (!currentDevice) return;

      // Đối với ADULT/CHILD, kiểm tra xem thiết bị có nằm trong dashboard devices không
      if (["ADULT", "CHILD"].includes(currentUser?.role as any)) {
        if (dashboardDeviceIds.has(deviceId)) {
          // Thiết bị nằm trong dashboard devices, điều khiển trực tiếp
          try {
            await devicesApi.updateStatus(deviceId, newStatus);
            toast.success(
              `Thiết bị ${deviceId} đã chuyển trạng thái thành ${newStatus.toLowerCase()} thành công!`
            );
            queryClient.invalidateQueries({ queryKey: ["devices"] });
          } catch (error: any) {
            toast.error(
              `Không thể chuyển trạng thái thiết bị ${deviceId} thành ${currentStatus.toLowerCase()}: ${
                error.message
              }`
            );
          }
        } else {
          // Thiết bị không nằm trong dashboard devices, cần yêu cầu
          if (pendingRequests[deviceId] === "APPROVED") {
            try {
              await devicesApi.updateStatus(deviceId, newStatus);
              toast.success(
                `Thiết bị ${deviceId} đã chuyển trạng thái thành ${newStatus.toLowerCase()} thành công!`
              );
              setPendingRequests((prev) => {
                const newState = { ...prev };
                delete newState[deviceId];
                return newState;
              });
              queryClient.invalidateQueries({ queryKey: ["devices"] });
            } catch (error: any) {
              toast.error(
                `Không thể chuyển trạng thái thiết bị ${deviceId} thành ${currentStatus.toLowerCase()}: ${
                  error.message
                }`
              );
            }
          } else {
            setDeviceToConfirmRequest(currentDevice);
            setNextStatusToRequest(newStatus);
            setIsRequestConfirmModalOpen(true);
          }
        }
      } else if (currentUser?.role === "GUEST" || currentDevice.isRestricted) {
        // GUEST hoặc thiết bị hạn chế luôn cần yêu cầu
        if (pendingRequests[deviceId] === "APPROVED") {
          try {
            await devicesApi.updateStatus(deviceId, newStatus);
            toast.success(
              `Thiết bị ${deviceId} đã chuyển trạng thái thành ${newStatus.toLowerCase()} thành công!`
            );
            setPendingRequests((prev) => {
              const newState = { ...prev };
              delete newState[deviceId];
              return newState;
            });
            queryClient.invalidateQueries({ queryKey: ["devices"] });
          } catch (error: any) {
            toast.error(
              `Không thể chuyển trạng thái thiết bị ${deviceId} thành ${currentStatus.toLowerCase()}: ${
                error.message
              }`
            );
          }
        } else {
          setDeviceToConfirmRequest(currentDevice);
          setNextStatusToRequest(newStatus);
          setIsRequestConfirmModalOpen(true);
        }
      }
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "light":
        return Lightbulb;
      case "air_conditioner":
        return Thermometer;
      case "humidity_sensor":
        return Droplet;
      case "temperature_sensor":
        return Sun;
      case "door":
      case "gate":
        return DoorOpen;
      case "alarm":
      case "siren":
      case "led_alarm":
        return Siren;
      case "fan":
        return Fan;
      default:
        return Power; // Default icon
    }
  };

  const deleteDevice = async (deviceId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thiết bị này không?")) {
      try {
        await devicesApi.remove(deviceId);
        queryClient.invalidateQueries({ queryKey: ["devices"] });
        toast.success("Device deleted successfully");
        if (editingDevice?.id === deviceId) {
          setIsEditModalOpen(false);
          setEditingDevice(undefined);
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to delete device");
      }
    }
  };

  const handleAddDeviceSubmit = (data: DeviceFormData) => {
    let defaultStatus: Device["status"];
    // Determine default status based on device type
    if (["door", "gate", "awning"].includes(data.type)) {
      defaultStatus = "CLOSE";
    } else if (
      [
        "soil_moisture_sensor",
        "pir_sensor",
        "gas_sensor",
        "rain_sensor",
        "light_sensor",
        "humidity_sensor",
        "temperature_sensor",
      ].includes(data.type)
    ) {
      defaultStatus = "INACTIVE";
    } else {
      defaultStatus = "OFF";
    }
    const newDevice: DeviceCreate = {
      name: data.name,
      type: data.type,
      roomId: data.roomId,
      description: data.description,
      status: defaultStatus,
      value: data.value,
      unit: data.unit,
      minThreshold: data.minThreshold,
      maxThreshold: data.maxThreshold,
    };
    addDeviceMutation.mutate(newDevice);
  };

  const handleUpdateDeviceSubmit = (data: DeviceFormData) => {
    if (!editingDevice) return;
    const updatedDevice: DeviceUpdate = {
      name: data.name,
      type: data.type,
      roomId: data.roomId,
      description: data.description,
      value: data.value,
      unit: data.unit,
      minThreshold: data.minThreshold,
      maxThreshold: data.maxThreshold,
    };
    updateDeviceMutation.mutate({ id: editingDevice.id, data: updatedDevice });
  };

  const handleEdit = (device: Device) => {
    setEditingDevice(device);
    setIsEditModalOpen(true);
  };

  // Filter devices (ensure devices is always an array)
  const filteredDevices = Array.isArray(devices)
    ? devices.filter((device) => {
        const matchesSearch = device.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === "all" || device.type === typeFilter;
        const matchesRoom =
          roomFilter === "all" || (device.roomId as string) === roomFilter;

        return matchesSearch && matchesType && matchesRoom;
      })
    : [];

  // Listen for real-time updates
  const { socket } = useSocket();
  // const { user: currentUser } = useAuthStore(); // Đã khai báo ở trên

  useEffect(() => {
    if (!socket || !currentUser?.id) return;

    socket.emit("setUserId", currentUser.id);

    socket.on(
      "deviceRequestUpdated",
      (data: {
        requestId: string;
        status: "APPROVED" | "REJECTED";
        deviceName?: string;
        newStatus?: "ON" | "OFF" | "OPEN" | "CLOSE" | "ACTIVE" | "INACTIVE";
      }) => {
        if (data.status === "APPROVED") {
          toast.success(
            `Yêu cầu điều khiển thiết bị ${
              data.deviceName
            } đã được duyệt và chuyển sang trạng thái ${data.newStatus?.toLowerCase()}.`
          );
        } else if (data.status === "REJECTED") {
          toast.error(
            `Yêu cầu điều khiển thiết bị ${
              data.deviceName || "của bạn"
            } đã bị từ chối.`
          );
        }
        setPendingRequests((prev) => ({
          ...prev,
          [data.requestId]: data.status,
        }));
        queryClient.invalidateQueries({ queryKey: ["devices"] }); // Cập nhật lại danh sách thiết bị
      }
    );

    return () => {
      socket.off("deviceRequestUpdated");
    };
  }, [socket, currentUser, queryClient]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 text-red-700 rounded-lg shadow">
        Lỗi tải thiết bị:{" "}
        {(error as any)?.response?.data?.message || error?.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý thiết bị</h1>
        {currentUser?.role === "ADMIN" && (
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Thêm thiết bị mới
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <Input
                type="text"
                className="block w-full pl-10 "
                placeholder="Tìm kiếm thiết bị..."
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
              <option value="all">Tất cả loại</option>
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
              <option value="all">Tất cả phòng</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Devices Table/Grid */}
      {filteredDevices.length === 0 ? (
        <div className="text-center py-12 bg-white shadow rounded-lg">
          <p className="text-gray-500">Không tìm thấy thiết bị nào.</p>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4"
            variant="outline"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Thêm thiết bị đầu tiên của bạn
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên thiết bị
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phòng
                </th>
                {currentUser?.role === "ADMIN" && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người điều khiển
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Công suất/Giá trị
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDevices.map((device) => {
                const assignedRoom = rooms.find((r) => r.id === device.roomId);
                const controllingMembers =
                  assignedRoom?.Users?.map((member) => member.fullName).join(
                    ", "
                  ) || "N/A";

                const shouldShowRequestButton =
                  currentUser?.role === "GUEST" ||
                  (["ADULT", "CHILD"].includes(currentUser?.role as any) &&
                    !dashboardDeviceIds.has(device.id));

                return (
                  <tr key={device.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        {React.createElement(getDeviceIcon(device.type), {
                          className: "h-5 w-5 text-indigo-500 mr-2",
                        })}
                        <span>{device.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignedRoom?.name || "Chưa gán phòng"}
                    </td>
                    {currentUser?.role === "ADMIN" && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {controllingMembers}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {device.value !== undefined && device.unit
                        ? `${device.value} ${device.unit}`
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          ["ON", "OPEN", "ACTIVE"].includes(
                            device.status as any
                          )
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {device.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {shouldShowRequestButton ? (
                          <button
                            onClick={() =>
                              handleRequestControl(
                                device.id,
                                device.status === "ON" ||
                                  device.status === "OPEN" ||
                                  device.status === "ACTIVE"
                                  ? "OFF"
                                  : "ON"
                              )
                            }
                            className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white transition-all duration-200 ease-in-out ${
                              pendingRequests[device.id] === "PENDING"
                                ? "bg-yellow-500 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                            disabled={pendingRequests[device.id] === "PENDING"}
                          >
                            {pendingRequests[device.id] === "PENDING"
                              ? "Đang chờ duyệt..."
                              : "Yêu cầu điều khiển"}
                          </button>
                        ) : (
                          <Switch
                            checked={["ON", "OPEN", "ACTIVE"].includes(
                              device.status as any
                            )}
                            onChange={() =>
                              handleDeviceToggle(
                                device.id,
                                device.status,
                                device.type
                              )
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                              ["ON", "OPEN", "ACTIVE"].includes(
                                device.status as any
                              )
                                ? "bg-indigo-600"
                                : "bg-gray-300"
                            }`}
                            disabled={pendingRequests[device.id] === "PENDING"}
                          >
                            <span className="sr-only">Bật/tắt thiết bị</span>
                            <span
                              aria-hidden="true"
                              className={`transform pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                ["ON", "OPEN", "ACTIVE"].includes(
                                  device.status as any
                                )
                                  ? "translate-x-5"
                                  : "translate-x-0"
                              }`}
                            />
                          </Switch>
                        )}
                        {currentUser?.role === "ADMIN" && (
                          <Button
                            variant="secondary"
                            onClick={() => handleEdit(device)}
                            className="inline-flex items-center px-3 py-1.5 text-xs"
                          >
                            Sửa
                          </Button>
                        )}
                        {currentUser?.role === "ADMIN" && (
                          <Button
                            variant="danger"
                            onClick={() => deleteDevice(device.id)}
                            className="inline-flex items-center px-3 py-1.5 text-xs"
                          >
                            Xóa
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Device Modal */}
      {currentUser?.role === "ADMIN" && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Thêm thiết bị mới"
          description="Điền thông tin để thêm một thiết bị thông minh mới vào nhà của bạn."
        >
          <DeviceForm
            onSubmit={handleAddDeviceSubmit}
            onCancel={() => setIsAddModalOpen(false)}
            isSubmitting={addDeviceMutation.status === "pending"}
            rooms={rooms}
          />
        </Modal>
      )}

      {/* Edit Device Modal */}
      {currentUser?.role === "ADMIN" && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingDevice(undefined);
          }}
          title="Sửa thiết bị"
          description="Cập nhật chi tiết thiết bị thông minh của bạn."
        >
          {editingDevice && (
            <DeviceForm
              onSubmit={handleUpdateDeviceSubmit}
              onCancel={() => {
                setIsEditModalOpen(false);
                setEditingDevice(undefined);
              }}
              isSubmitting={updateDeviceMutation.status === "pending"}
              initialData={editingDevice}
              rooms={rooms}
            />
          )}
        </Modal>
      )}

      {/* Request Control Confirmation Modal */}
      <Modal
        isOpen={isRequestConfirmModalOpen}
        onClose={() => setIsRequestConfirmModalOpen(false)}
        title="Gửi yêu cầu điều khiển thiết bị?"
        description={`Bạn có muốn gửi yêu cầu điều khiển thiết bị "${
          deviceToConfirmRequest?.name
        }" sang trạng thái ${nextStatusToRequest?.toLowerCase()} không? Yêu cầu này sẽ được gửi đến Admin để phê duyệt.`}
      >
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="secondary"
            onClick={() => setIsRequestConfirmModalOpen(false)}
          >
            Hủy
          </Button>
          <Button
            onClick={async () => {
              if (deviceToConfirmRequest && nextStatusToRequest) {
                await handleRequestControl(
                  deviceToConfirmRequest.id,
                  nextStatusToRequest
                );
                setIsRequestConfirmModalOpen(false);
                setDeviceToConfirmRequest(undefined);
                setNextStatusToRequest(undefined);
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Gửi yêu cầu
          </Button>
        </div>
      </Modal>
    </div>
  );
}
