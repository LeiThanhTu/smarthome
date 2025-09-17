import { useState } from "react";
import { useForm } from "react-hook-form";
import Modal from "../../components/Modal";
import { RoomAPI } from "../../api/room.api";
import type { Room, RoomCreate, RoomUpdate } from "../../types/room";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, TrashIcon, PencilIcon } from "lucide-react";
import { getRoomImage } from "../Dashboard"; // Sử dụng hàm getRoomImage từ Dashboard
import { devicesApi } from "../../api/devices.api";
import { UsersAPI } from "../../api/users.api";
import { api } from "../../api/http"; // Import api
import { useSocket } from "../../context/SocketContext"; // Import useSocket
import type { DeviceData } from "../../types/home.types";
import type { User } from "../../types/user";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { toast } from "react-toastify";
import { useAuthStore } from "../../store/auth.store"; // Import useAuthStore
import React, { useEffect } from "react"; // Import React for React.createElement
import {
  Lightbulb,
  Thermometer,
  Droplet,
  Sun,
  DoorOpen,
  Siren,
  Fan,
} from "lucide-react";

export default function Rooms() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]); // Thay đổi kiểu dữ liệu thành string[]
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [pendingRequests, setPendingRequests] = useState<{
    [key: string]: "PENDING" | "APPROVED" | "REJECTED";
  }>({}); // Lưu trữ trạng thái yêu cầu của thiết bị

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoomCreate>();
  const queryClient = useQueryClient();
  const { user } = useAuthStore(); // Lấy thông tin người dùng từ store

  const {
    data: rooms,
    isLoading,
    isError,
    error,
  } = useQuery<Room[], Error>({
    queryKey: ["rooms", user?.id],
    queryFn: RoomAPI.getAll,
  });

  const { data: allDevices } = useQuery<DeviceData[], Error>({
    queryKey: ["devices-all"],
    queryFn: async () => {
      const devices = await devicesApi.getAll();
      // Map API Device to UI DeviceData (id should be string)
      return devices.map((d: any) => ({
        id: d.id, // Giữ nguyên id là string
        name: d.name,
        type: d.type,
        status: (d.status || "OFF").toUpperCase(),
        value: d.value,
        unit: d.unit,
        minThreshold: d.minThreshold,
        maxThreshold: d.maxThreshold,
        isRestricted: d.isRestricted, // Lấy isRestricted từ API
      })) as DeviceData[];
    },
  });

  const { data: allUsers } = useQuery<User[], Error>({
    queryKey: ["users-all"],
    queryFn: UsersAPI.list,
  });

  const createRoomMutation = useMutation<Room, Error, RoomCreate>({
    mutationFn: RoomAPI.create,
    onSuccess: () => {
      toast.success("Tạo phòng thành công!");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setOpen(false);
      reset();
      setSelectedDevices([]);
      setSelectedMembers([]);
    },
    onError: (err) => {
      toast.error(`Lỗi tạo phòng: ${err.message}`);
    },
  });

  const updateRoomMutation = useMutation<
    Room,
    Error,
    { id: string; data: RoomUpdate }
  >({
    mutationFn: ({ id, data }) => RoomAPI.update(id, data),
    onSuccess: () => {
      toast.success("Cập nhật phòng thành công!");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setOpen(false);
      reset();
      setSelectedDevices([]);
      setSelectedMembers([]);
    },
    onError: (err) => {
      toast.error(`Lỗi cập nhật phòng: ${err.message}`);
    },
  });

  const deleteRoomMutation = useMutation<void, Error, string>({
    mutationFn: RoomAPI.delete,
    onSuccess: () => {
      toast.success("Xóa phòng thành công!");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: (err) => {
      toast.error(`Lỗi xóa phòng: ${err.message}`);
    },
  });

  const handleRequestControl = async (
    deviceId: string,
    requestedStatus: "ON" | "OFF" | "OPEN" | "CLOSE" | "ACTIVE" | "INACTIVE",
    message?: string
  ) => {
    try {
      const response = await api.post(`/devicerequests`, {
        deviceId,
        requestedStatus,
        message,
      });
      toast.success(response.data.message);
      setPendingRequests((prev) => ({ ...prev, [deviceId]: "PENDING" })); // Đặt trạng thái yêu cầu là PENDING
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
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
    deviceType: string,
    isRestricted: boolean // Thêm isRestricted
  ) => {
    let newStatus: "ON" | "OFF" | "OPEN" | "CLOSE" | "ACTIVE" | "INACTIVE";
    if (deviceType === "door" || deviceType === "gate") {
      newStatus = currentStatus === "OPEN" ? "CLOSE" : "OPEN";
    } else if (deviceType.includes("sensor")) {
      newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    } else {
      newStatus = currentStatus === "ON" ? "OFF" : "ON";
    }

    // Kiểm tra quyền
    const needsRequest = user?.role === "GUEST" || isRestricted; // GUEST luôn cần yêu cầu hoặc thiết bị bị giới hạn

    if (needsRequest && user?.role !== "ADMIN") {
      handleRequestControl(deviceId, newStatus); // Gửi yêu cầu
      return;
    }

    // Nếu không cần yêu cầu hoặc là ADMIN, thực hiện điều khiển trực tiếp
    try {
      await devicesApi.updateStatus(deviceId, newStatus);
      toast.success(
        `Thiết bị ${deviceId} đã chuyển trạng thái thành ${newStatus.toLowerCase()} thành công!`
      );
      queryClient.invalidateQueries({ queryKey: ["rooms"] }); // Invalidate rooms query to refetch data
    } catch (error: any) {
      toast.error(
        `Không thể chuyển trạng thái thiết bị ${deviceId} thành ${currentStatus.toLowerCase()}: ${
          error.message
        }`
      );
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
        return Siren;
      case "fan":
        return Fan;
      default:
        return Lightbulb; // Default icon
    }
  };

  const onSubmit = async (data: RoomCreate) => {
    const roomData: RoomCreate = { ...data, memberIds: selectedMembers };
    try {
      let roomResult: Room;
      if (editing) {
        roomResult = await updateRoomMutation.mutateAsync({
          id: editing.id,
          data: roomData,
        });
      } else {
        roomResult = await createRoomMutation.mutateAsync(roomData);
      }

      // Cập nhật roomId cho các thiết bị được chọn
      if (selectedDevices.length > 0) {
        await Promise.all(
          selectedDevices.map((deviceId) =>
            devicesApi.update(deviceId.toString(), { roomId: roomResult.id })
          )
        );
      }

      toast.success(
        editing ? "Cập nhật phòng thành công!" : "Tạo phòng thành công!"
      );
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setOpen(false);
      reset();
      setSelectedDevices([]);
      setSelectedMembers([]);
    } catch (err: any) {
      toast.error(`Lỗi ${editing ? "cập nhật" : "tạo"} phòng: ${err.message}`);
    }
  };

  const handleEdit = (room: Room) => {
    setEditing(room);
    reset({
      name: room.name,
      description: room.description,
    });
    setSelectedDevices(room.devices?.map((d) => d.id) || []);
    setSelectedMembers(room.Users?.map((u) => u.id) || []);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phòng này không?")) {
      deleteRoomMutation.mutate(id);
    }
  };

  const openCreate = () => {
    setEditing(null);
    reset({
      name: "",
      description: "",
    });
    setSelectedDevices([]);
    setSelectedMembers([]);
    setOpen(true);
  };

  const { socket } = useSocket(); // Lấy socket instance
  useEffect(() => {
    if (!socket || !user?.id) return;

    // Gửi userId đến server để lưu trữ socketId
    socket.emit("setUserId", user.id);

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
          // queryClient.invalidateQueries({ queryKey: ["rooms"] }); // Cập nhật lại danh sách phòng sau khi duyệt
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
        queryClient.invalidateQueries({ queryKey: ["rooms"] });
      }
    );

    return () => {
      socket.off("deviceRequestUpdated");
    };
  }, [socket, user, queryClient]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 bg-red-50 text-red-700 rounded-lg shadow">
        Lỗi tải phòng:{" "}
        {(error as any)?.response?.data?.message || error?.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý phòng</h1>
        {user?.role === "ADMIN" && (
          <Button
            onClick={openCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <PlusIcon className="w-5 h-5 mr-2" /> Thêm phòng mới
          </Button>
        )}
      </div>

      {rooms && rooms.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m-1-4v-4a1 1 0 011-1h2a1 1 0 011 1v4m-4 0h4"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            Chưa có phòng nào
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Bắt đầu bằng cách tạo một phòng mới.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms?.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-lg shadow overflow-hidden transform transition duration-300 hover:scale-105 flex flex-col h-full"
            >
              <img
                src={getRoomImage(room.name)}
                alt={room.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {room.name}
                  </h3>
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                    {room.type?.replace("_", " ")}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{room.description}</p>

                {/* Devices in Room */}
                {room.devices && room.devices.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-md font-semibold text-gray-800 mb-2">
                      Thiết bị:
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {room.devices?.map((device) => {
                        const isSensor = device.type.includes("sensor");
                        // Chỉ ADMIN được phép điều khiển trực tiếp trong tab Rooms
                        const canControl = user?.role === "ADMIN";
                        // GUEST hoặc thiết bị bị giới hạn thì cần gửi yêu cầu
                        const needsRequest =
                          user?.role === "GUEST" || device.isRestricted;

                        const displayStatusText = (status: string) => status; // Hiển thị trạng thái gốc bằng tiếng Anh

                        const getNextStatusForAction = () => {
                          if (
                            device.type === "door" ||
                            device.type === "gate"
                          ) {
                            return device.status === "OPEN" ? "CLOSE" : "OPEN";
                          } else if (device.type.includes("sensor")) {
                            return device.status === "ACTIVE"
                              ? "INACTIVE"
                              : "ACTIVE";
                          } else {
                            return device.status === "ON" ? "OFF" : "ON";
                          }
                        };

                        const isDeviceOn = ["ON", "OPEN", "ACTIVE"].includes(
                          device.status as any
                        );
                        // const currentStatusText = displayStatusText(
                        //   device.status
                        // );
                        // const nextStatusText = displayStatusText(
                        //   getNextStatusForAction()
                        // );

                        // Helper component for status badge
                        const StatusBadge = ({
                          status,
                        }: {
                          status: string;
                        }) => {
                          let bgColor = "bg-gray-200";
                          let textColor = "text-gray-800";
                          let displayStatus = displayStatusText(status);
                          if (
                            status === "ON" ||
                            status === "ACTIVE" ||
                            status === "OPEN"
                          ) {
                            bgColor = "bg-green-100";
                            textColor = "text-green-800";
                          } else if (
                            status === "OFF" ||
                            status === "INACTIVE" ||
                            status === "CLOSE"
                          ) {
                            bgColor = "bg-red-100";
                            textColor = "text-red-800";
                          }
                          return (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
                            >
                              {displayStatus}
                            </span>
                          );
                        };

                        return (
                          <div key={device.id} className="flex-1 min-w-0">
                            {isSensor ? (
                              <div
                                className={`flex flex-col items-center justify-center p-3 rounded-lg shadow-sm bg-gray-200 text-gray-800 transition-colors duration-200 ease-in-out h-[90px] w-full`}
                              >
                                {React.createElement(
                                  getDeviceIcon(device.type),
                                  {
                                    className: "h-6 w-6 text-gray-500 mb-1",
                                  }
                                )}
                                <span className="text-base font-medium text-center">
                                  {device.name}
                                </span>
                                {device.value !== undefined && device.unit ? (
                                  <span className="text-xs font-semibold text-gray-600">
                                    {`${device.value} ${device.unit}`}
                                  </span>
                                ) : (
                                  <StatusBadge status={device.status} />
                                )}
                              </div>
                            ) : needsRequest && user?.role === "GUEST" ? (
                              <button
                                onClick={() =>
                                  handleRequestControl(
                                    device.id,
                                    getNextStatusForAction()
                                  )
                                }
                                className={`flex flex-col items-center justify-center p-3 rounded-lg shadow-sm text-white transition-colors duration-200 ease-in-out h-[90px] w-full ${
                                  pendingRequests[device.id] === "PENDING"
                                    ? "bg-yellow-500 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                                }`}
                                disabled={
                                  pendingRequests[device.id] === "PENDING"
                                }
                              >
                                {React.createElement(
                                  getDeviceIcon(device.type),
                                  {
                                    className: "h-6 w-6 text-white mb-1",
                                  }
                                )}
                                <span className="text-base font-medium text-center">
                                  {device.name}
                                </span>
                                {pendingRequests[device.id] === "PENDING" ? (
                                  <span className="text-xs font-semibold text-white">
                                    Đang chờ Admin duyệt...
                                  </span>
                                ) : (
                                  <StatusBadge status={device.status} />
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleDeviceToggle(
                                    device.id,
                                    device.status,
                                    device.type,
                                    device.isRestricted || false
                                  )
                                }
                                className={`flex flex-col items-center justify-center p-3 rounded-lg shadow-sm transition-colors duration-200 ease-in-out h-[90px] w-full ${
                                  isDeviceOn
                                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                                }`}
                                disabled={!canControl}
                              >
                                {React.createElement(
                                  getDeviceIcon(device.type),
                                  {
                                    className: `h-6 w-6 mb-1 ${
                                      isDeviceOn
                                        ? "text-white"
                                        : "text-gray-500"
                                    }`,
                                  }
                                )}
                                <span className="text-base font-medium text-center">
                                  {device.name}
                                </span>
                                <StatusBadge status={device.status} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Bỏ hiển thị Thành viên */}

                <div className="mt-auto flex justify-end space-x-3">
                  {user?.role === "ADMIN" && (
                    <Button
                      variant="secondary"
                      onClick={() => handleEdit(room)}
                      className="inline-flex items-center"
                    >
                      <PencilIcon className="w-4 h-4 mr-2" /> Sửa
                    </Button>
                  )}
                  {user?.role === "ADMIN" && (
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(room.id)}
                      className="inline-flex items-center"
                    >
                      <TrashIcon className="w-4 h-4 mr-2" /> Xóa
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editing ? "Sửa thông tin phòng" : "Thêm phòng mới"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Tên phòng <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              id="name"
              {...register("name", { required: "Tên phòng là bắt buộc" })}
              error={errors.name?.message}
              className="mt-1 block w-full"
              placeholder="Ví dụ: Phòng khách"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Mô tả
            </label>
            <textarea
              id="description"
              rows={3}
              {...register("description")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Mô tả chi tiết về phòng (không bắt buộc)"
            />
          </div>

          {/* Chọn thiết bị */}
          {allDevices && allDevices.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thiết bị trong phòng
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border p-2 rounded-md">
                {allDevices.map((device) => (
                  <div key={device.id} className="flex items-center">
                    <input
                      id={`device-${device.id}`}
                      type="checkbox"
                      value={device.id}
                      checked={selectedDevices.includes(device.id)}
                      onChange={() => {
                        setSelectedDevices((prev) =>
                          prev.includes(device.id)
                            ? prev.filter((id) => id !== device.id)
                            : [...prev, device.id]
                        );
                      }}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label
                      htmlFor={`device-${device.id}`}
                      className="ml-2 text-sm text-gray-900"
                    >
                      {device.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chọn thành viên */}
          {allUsers && allUsers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Các thành viên điều khiển phòng
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border p-2 rounded-md">
                {allUsers
                  .filter((user) => user.role !== "GUEST") // Lọc bỏ người dùng có vai trò GUEST
                  .map((user) => (
                    <div key={user.id} className="flex items-center">
                      <input
                        id={`member-${user.id}`}
                        type="checkbox"
                        value={user.id}
                        checked={selectedMembers.includes(user.id)}
                        onChange={() => {
                          setSelectedMembers((prev) =>
                            prev.includes(user.id)
                              ? prev.filter((id) => id !== user.id)
                              : [...prev, user.id]
                          );
                        }}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <label
                        htmlFor={`member-${user.id}`}
                        className="ml-2 text-sm text-gray-900"
                      >
                        {user.fullName} ({user.role})
                      </label>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end gap-x-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={
                createRoomMutation.isPending || updateRoomMutation.isPending
              }
            >
              {editing ? "Cập nhật" : "Tạo phòng"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
