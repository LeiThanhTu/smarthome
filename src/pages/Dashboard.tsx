import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth.store";
import { Link } from "react-router-dom";
import { BarChart3, Home, Lightbulb, Clock, Users } from "lucide-react";
import { Thermometer, Droplet, Sun, DoorOpen, Siren, Fan } from "lucide-react";
// Default room image is resolved via helper below
import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { toast } from "react-toastify";
import { api } from "../api/http";
import {
  type HomeOverviewData,
  type RoomData,
  type DeviceData,
  // type DeviceRequestData, // Import DeviceRequestData
} from "../types/home.types";
import dashboardBanner from "../images/dashboard-banner.jpg"; // Ảnh banner Dashboard
import roomLivingRoom from "../images/room-living-room.png";
import roomGarden from "../images/room-garden.png";
import roomGarage from "../images/room-garage.png";
import roomKitchen from "../images/room-kitchen.png";
import roomDryingYard from "../images/room-drying-yard.png";
import roomTerrace from "../images/room-terrace.png";

export const getRoomImage = (roomName: string) => {
  // Hàm trả về ảnh cho từng loại phòng
  // Currently using dashboardBanner as default since specific room images are missing
  const lowerCaseRoomName = roomName.toLowerCase();
  if (lowerCaseRoomName.includes("garden")) return roomGarden;
  if (lowerCaseRoomName.includes("living room")) return roomLivingRoom;
  if (
    lowerCaseRoomName.includes("storage") ||
    lowerCaseRoomName.includes("garage")
  )
    return roomGarage;
  if (lowerCaseRoomName.includes("kitchen")) return roomKitchen;
  if (lowerCaseRoomName.includes("drying yard")) return roomDryingYard;
  if (lowerCaseRoomName.includes("terrace")) return roomTerrace;
  return dashboardBanner; // Ảnh mặc định
};

// Định nghĩa kiểu dữ liệu cho sensor và device
interface SensorData {
  id: string;
  type: string;
  value: string;
  timestamp: string;
}

interface DeviceStatus {
  name: string;
  status: "ON" | "OFF" | "OPEN" | "CLOSE" | "ACTIVE" | "INACTIVE";
  isRestricted?: boolean; // Thêm trường isRestricted
  requestId?: string; // ID của yêu cầu nếu có
  requestStatus?: "PENDING" | "APPROVED" | "REJECTED"; // Trạng thái của yêu cầu
}

// Mock data - replace with actual API calls
const fetchDashboardData = async (): Promise<HomeOverviewData> => {
  const response = await api.get("/users/home");
  return response.data as HomeOverviewData;
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  colorClass = "bg-indigo-500",
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorClass?: string;
}) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className={`flex-shrink-0 rounded-md ${colorClass} p-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {value}
              </div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
    <div className={`bg-gray-50 px-5 py-3`}>
      <div className="text-sm">
        <Link
          to="#"
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          View all
        </Link>
      </div>
    </div>
  </div>
);

const ActivityItem = ({
  activity,
}: {
  activity: { type: string; name: string; action: string; time: string };
}) => {
  const getIcon = () => {
    switch (activity.type) {
      case "device":
        return <Lightbulb className="h-5 w-5 text-blue-500" />;
      case "schedule":
        return <Clock className="h-5 w-5 text-green-500" />;
      case "sensor":
        return <BarChart3 className="h-5 w-5 text-yellow-500" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-200" />;
    }
  };

  return (
    <div className="flex items-center space-x-4 p-4 hover:bg-gray-50">
      <div className="flex-shrink-0">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {activity.name}
        </p>
        <p className="text-sm text-gray-500 truncate">{activity.action}</p>
      </div>
      <div className="text-sm text-gray-500">{activity.time}</div>
    </div>
  );
};

interface DeviceControlCardProps {
  deviceName: string;
  status: "ON" | "OFF" | "OPEN" | "CLOSE" | "ACTIVE" | "INACTIVE";
  deviceType: string;
  deviceId: string; // Thay đổi từ number sang string
  onToggle?: (
    command: "ON" | "OFF" | "OPEN" | "CLOSE" | "ACTIVE" | "INACTIVE"
  ) => void;
  onRequestControl: (
    deviceId: string, // Đã sửa từ deviceName sang deviceId
    requestedStatus: "ON" | "OFF" | "OPEN" | "CLOSE" | "ACTIVE" | "INACTIVE",
    message?: string
  ) => void;
  icon: React.ElementType;
  userRole?: string;
  value?: number;
  unit?: string;
  minThreshold?: number;
  maxThreshold?: number;
  requestStatus?: "PENDING" | "APPROVED" | "REJECTED"; // Trạng thái của yêu cầu
}

const DeviceControlCard: React.FC<DeviceControlCardProps> = ({
  deviceName,
  status,
  deviceType,
  onToggle,
  onRequestControl,
  icon: Icon,
  userRole,
  value,
  unit,
  minThreshold,
  maxThreshold,
  requestStatus,
  deviceId,
}) => {
  const isToggleAllowed =
    userRole === "ADMIN" ||
    userRole === "ADULT" ||
    userRole === "CHILD" ||
    requestStatus === "APPROVED"; // ADMIN, ADULT, CHILD luôn được phép hoặc đã được phê duyệt
  const needsRequest = userRole === "GUEST"; // Chỉ GUEST cần yêu cầu

  const handleToggle = () => {
    let newStatus: "ON" | "OFF" | "OPEN" | "CLOSE" | "ACTIVE" | "INACTIVE";
    if (deviceType === "door" || deviceType === "gate") {
      newStatus = status === "OPEN" ? "CLOSE" : "OPEN";
    } else if (deviceType.includes("sensor")) {
      newStatus = status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    } else {
      newStatus = status === "ON" ? "OFF" : "ON";
    }

    if (needsRequest && requestStatus !== "APPROVED") {
      onRequestControl(deviceId, newStatus); // Gửi yêu cầu với deviceId
      return;
    }

    if (!isToggleAllowed) {
      toast.warn("You don't have permission to control this device.");
      return;
    }

    onToggle?.(newStatus); // Gọi onToggle nếu có
  };

  const displayStatusText = requestStatus
    ? requestStatus === "PENDING"
      ? "Đang chờ duyệt"
      : requestStatus === "APPROVED"
      ? `Đã duyệt (${
          status === "ON" ? "Bật" : status === "OFF" ? "Tắt" : "..."
        })`
      : "Đã từ chối"
    : status === "ON"
    ? "Bật"
    : status === "OFF"
    ? "Tắt"
    : status === "OPEN"
    ? "Mở"
    : status === "CLOSE"
    ? "Đóng"
    : status === "ACTIVE"
    ? "Hoạt động"
    : "Không hoạt động";

  const displayStatusColorClass = requestStatus
    ? requestStatus === "PENDING"
      ? "text-yellow-600"
      : requestStatus === "APPROVED"
      ? "text-green-600"
      : "text-red-600"
    : ["ON", "OPEN", "ACTIVE"].includes(status)
    ? "text-green-600"
    : "text-red-600";

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg p-5 flex items-center justify-between">
      <div className="flex items-center">
        <div className="flex-shrink-0 rounded-md bg-indigo-500 p-3">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-5">
          <h3 className="text-lg font-medium text-gray-900">{deviceName}</h3>
          <p className={`text-sm ${displayStatusColorClass}`}>
            Trạng thái: {displayStatusText}
          </p>
          {deviceType.includes("sensor") && value !== undefined && (
            <p className="text-sm text-gray-500">
              Giá trị: {value} {unit}
            </p>
          )}
          {minThreshold !== undefined && maxThreshold !== undefined && (
            <p className="text-sm text-gray-500">
              Ngưỡng: {minThreshold} - {maxThreshold} {unit}
            </p>
          )}
        </div>
      </div>
      {needsRequest && requestStatus !== "APPROVED" ? (
        <button
          onClick={handleToggle}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
            requestStatus === "PENDING"
              ? "bg-yellow-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          disabled={requestStatus === "PENDING"} // Disable khi đang chờ duyệt
        >
          {requestStatus === "PENDING"
            ? "Đang chờ Admin duyệt..."
            : "Yêu cầu điều khiển"}
        </button>
      ) : (
        <button
          onClick={handleToggle}
          className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
            ${
              ["ON", "OPEN", "ACTIVE"].includes(status)
                ? "bg-indigo-600"
                : "bg-gray-200"
            }
            ${!isToggleAllowed && "opacity-50 cursor-not-allowed"}
          `}
          disabled={!isToggleAllowed} // Disable khi không được phép điều khiển hoặc đang chờ duyệt
        >
          <span className="sr-only">Use setting</span>
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200
              ${
                ["ON", "OPEN", "ACTIVE"].includes(status)
                  ? "translate-x-5"
                  : "translate-x-0"
              }
            `}
          />
        </button>
      )}
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const { socket } = useSocket();
  const queryClient = useQueryClient(); // Lấy queryClient
  // const [sensorData, setSensorData] = useState<{ [key: string]: SensorData }>(
  //   {}
  // );
  const [deviceStatus, setDeviceStatus] = useState<{
    [key: string]: DeviceStatus;
  }>({});
  const [pendingRequests, setPendingRequests] = useState<{
    [key: string]: "PENDING" | "APPROVED" | "REJECTED";
  }>({}); // Lưu trữ trạng thái yêu cầu của thiết bị

  useEffect(() => {
    if (!socket || !user?.id) return;

    // Gửi userId đến server để lưu trữ socketId
    socket.emit("setUserId", user.id);

    socket.on("sensorData", (data: SensorData) => {
      console.log("Received sensorData:", data);
      // setSensorData((prev) => ({ ...prev, [data.type]: data })); // Removed as per edit hint
    });

    socket.on("deviceStatus", (data: { name: string; status: string }) => {
      console.log("Received deviceStatus:", data);
      setDeviceStatus((prev) => ({
        ...prev,
        [data.name]: {
          name: data.name,
          status: data.status.toUpperCase() as DeviceStatus["status"],
        },
      }));
    });

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
          setDeviceStatus((prev) => ({
            ...prev,
            [data.requestId]: {
              ...prev[data.requestId],
              ...(data.newStatus && { status: data.newStatus }), // Chỉ cập nhật status nếu newStatus được cung cấp
            },
          }));
        } else if (data.status === "REJECTED") {
          toast.error(
            `Yêu cầu điều khiển thiết bị ${
              data.deviceName || "của bạn"
            } đã bị từ chối.`
          );
        }
        // Cập nhật trạng thái yêu cầu
        setPendingRequests((prev) => ({
          ...prev,
          [data.requestId]: data.status,
        }));
        // Force refetch dashboard data to update UI with latest device status and requests
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      }
    );

    return () => {
      socket.off("sensorData");
      socket.off("deviceStatus");
      socket.off("deviceRequestUpdated");
    };
  }, [socket, user, queryClient]); // Thêm queryClient vào dependency array

  const { data, isLoading, error } = useQuery<HomeOverviewData, Error>({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!data?.rooms) return;
    const initialDeviceStatus: { [key: string]: DeviceStatus } = {};
    data.rooms.forEach((room: RoomData) => {
      room.devices.forEach((device: DeviceData) => {
        initialDeviceStatus[device.id.toString()] = {
          name: device.name,
          status: device.status,
        };
      });
    });
    setDeviceStatus(initialDeviceStatus);
  }, [data]);

  // Force refetch dashboard data when user changes to ensure latest permissions
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  }, [user?.id, queryClient]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Lỗi tải dữ liệu Dashboard
            </h3>
            <p className="mt-2 text-sm text-red-700">
              {(error as any)?.response?.data?.message || error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleDeviceControl = async (
    deviceId: string,
    command: "ON" | "OFF" | "OPEN" | "CLOSE" | "ACTIVE" | "INACTIVE"
  ) => {
    try {
      await api.patch(`/devices/${deviceId}`, {
        status: command, // Backend expects uppercase
      });
      toast.success(
        `Thiết bị ${deviceId} đã chuyển trạng thái thành ${command.toLowerCase()} thành công!`
      );
      // Update device status in state
      setDeviceStatus((prev) => ({
        ...prev,
        [deviceId]: { ...prev[deviceId], status: command },
      }));
    } catch (error: any) {
      toast.error(
        `Không thể chuyển trạng thái thiết bị ${deviceId} thành ${command.toLowerCase()}: ${
          error.message
        }`
      );
    }
  };

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
      queryClient.invalidateQueries({ queryKey: ["dashboard"] }); // Uncomment và thêm queryClient vào đây
    } catch (error: any) {
      toast.error(
        `Không thể gửi yêu cầu điều khiển: ${
          error.response?.data?.message || error.message
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan nhà</h1>
        <p className="mt-1 text-sm text-gray-500">
          {data?.message ||
            `Chào mừng trở lại, ${
              user?.fullName || user?.email
            }! Đây là tổng quan nhà của bạn.`}
        </p>
      </div>

      {data && user?.role === "GUEST" && data.summary && (
        <div className="grid grid-cols-1 gap-5 mt-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Tổng số phòng"
            value={data.summary.totalRooms || 0}
            icon={Home}
            colorClass="bg-blue-500"
          />
          <StatCard
            title="Tổng số thiết bị"
            value={data.summary.totalDevices || 0}
            icon={Lightbulb}
            colorClass="bg-green-500"
          />
        </div>
      )}

      {data && user?.role !== "GUEST" && data.rooms && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 mt-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Tổng số phòng"
              value={data.rooms.length || 0}
              icon={Home}
              colorClass="bg-blue-500"
            />
            <StatCard
              title="Tổng số thiết bị"
              value={
                data.rooms.reduce(
                  (acc: number, room: RoomData) => acc + room.devices.length,
                  0
                ) || 0
              }
              icon={Lightbulb}
              colorClass="bg-green-500"
            />
            {user?.role === "ADMIN" &&
              (() => {
                const totalUsersFromSummary = data.summary?.totalUsers;
                const totalUsersFallback = (() => {
                  if (!data.rooms) return 0;
                  const uniqueIds = new Set<string>();
                  data.rooms.forEach((room: RoomData) => {
                    room.Users?.forEach((member) => uniqueIds.add(member.id));
                  });
                  return uniqueIds.size;
                })();
                const totalUsers =
                  typeof totalUsersFromSummary === "number"
                    ? totalUsersFromSummary
                    : totalUsersFallback;
                return (
                  <StatCard
                    title="Người dùng"
                    value={totalUsers}
                    icon={Users}
                    colorClass="bg-purple-500"
                  />
                );
              })()}
          </div>

          {/* Banner chính */}
          <div className="relative w-full h-64 rounded-lg overflow-hidden mt-6">
            <img
              src={dashboardBanner}
              alt="Smart Home Dashboard Banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <h2 className="text-3xl font-bold text-white text-center">
                Ngôi nhà thông minh của bạn
              </h2>
            </div>
          </div>

          {/* Device Controls */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Điều khiển thiết bị
            </h2>
            {data.rooms.map((room: RoomData) => (
              <div
                key={room.id}
                className="mb-8 p-4 bg-white shadow rounded-lg"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={getRoomImage(room.name)}
                    alt={room.name}
                    className="w-16 h-16 rounded-md object-cover mr-4"
                  />
                  <h3 className="text-lg font-semibold text-gray-800">
                    {room.name}
                  </h3>
                  {user?.role === "ADMIN" &&
                    room.Users &&
                    room.Users.length > 0 && (
                      <div className="ml-auto flex -space-x-2 overflow-hidden">
                        {room.Users.map((member) => (
                          <img
                            key={member.id}
                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                            src={member.avatar || "/uploads/default-avatar.png"}
                            alt={member.fullName}
                            title={member.fullName}
                          />
                        ))}
                      </div>
                    )}
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {room.devices.map((device: DeviceData) => (
                    <DeviceControlCard
                      key={device.id}
                      deviceName={device.name}
                      status={
                        (deviceStatus[device.id.toString()]?.status ||
                          device.status) as DeviceControlCardProps["status"]
                      }
                      deviceType={device.type}
                      deviceId={device.id.toString()} // Pass as string
                      onToggle={(cmd) =>
                        handleDeviceControl(device.id.toString(), cmd)
                      }
                      onRequestControl={handleRequestControl} // Pass the new handler
                      icon={getDeviceIcon(device.type)} // Lấy icon dựa trên device.type
                      userRole={user?.role}
                      value={device.value}
                      unit={device.unit}
                      minThreshold={device.minThreshold}
                      maxThreshold={device.maxThreshold}
                      requestStatus={pendingRequests[device.id.toString()]} // Pass requestStatus
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sensor Data Display */}
      {/* Loại bỏ phần hiển thị sensorData riêng vì đã gộp vào DeviceControlCard */}

      {/* Recent Activity */}
      {/* Có thể ẩn phần này cho GUEST nếu cần */}
      {data &&
        data.recentActivity &&
        (user?.role === "ADMIN" ||
          user?.role === "ADULT" ||
          user?.role === "CHILD") && (
          <div className="mt-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Hoạt động gần đây
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Tổng quan về các hoạt động gần đây trong nhà thông minh của
                  bạn
                </p>
              </div>
              <div className="divide-y divide-gray-200">
                {data.recentActivity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
          </div>
        )}

      {/* Role-based content */}
      {user?.role === "ADMIN" && (
        <div className="mt-8 bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-blue-800">
            Điều khiển Admin
          </h3>
          <p className="mt-1 text-sm text-blue-700">
            Quản lý người dùng, thiết bị và cài đặt hệ thống từ bảng điều khiển
            admin.
          </p>
          <div className="mt-4">
            <Link
              to="/admin"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Đi tới Bảng điều khiển Admin
            </Link>
          </div>
        </div>
      )}

      {user?.role === "CHILD" && (
        <div className="mt-8 bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-green-800">
            Điều khiển của trẻ em
          </h3>
          <p className="mt-1 text-sm text-green-700">
            Bạn có thể điều khiển các thiết bị cơ bản trong phòng của mình. Hãy
            hỏi cha mẹ để được giúp đỡ với các cài đặt nâng cao.
          </p>
        </div>
      )}
    </div>
  );
}
