import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth.store";
import { Link } from "react-router-dom";
import { BarChart3, Home, Lightbulb, Clock, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { toast } from "react-toastify";
import { api } from "../api/http";

// Định nghĩa kiểu dữ liệu cho sensor và device
interface SensorData {
  id: string;
  type: string;
  value: string;
  timestamp: string;
}

interface DeviceStatus {
  name: string;
  status: "on" | "off";
}

// Mock data - replace with actual API calls
const fetchDashboardData = async () => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    totalRooms: 5,
    totalDevices: 12,
    activeDevices: 8,
    totalSensors: 7,
    recentActivity: [
      {
        id: 1,
        type: "device",
        name: "Living Room Light",
        action: "turned on",
        time: "2 minutes ago",
      },
      {
        id: 2,
        type: "schedule",
        name: "Morning Routine",
        action: "completed",
        time: "1 hour ago",
      },
      {
        id: 3,
        type: "sensor",
        name: "Temperature Sensor",
        action: "alert: high temperature",
        time: "3 hours ago",
      },
    ],
  };
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  color = "indigo",
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
}) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className={`flex-shrink-0 rounded-md bg-${color}-500 p-3`}>
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
  status: "on" | "off";
  onToggle: (command: "on" | "off" | "open" | "close") => void;
  icon: React.ElementType;
  allowedRoles?: string[];
  userRole?: string;
}

const DeviceControlCard: React.FC<DeviceControlCardProps> = ({
  deviceName,
  status,
  onToggle,
  icon: Icon,
  allowedRoles,
  userRole,
}) => {
  const isToggleAllowed = allowedRoles
    ? userRole && allowedRoles.includes(userRole)
    : true;

  const handleToggle = () => {
    if (!isToggleAllowed) {
      toast.warn("You don't have permission to control this device.");
      return;
    }
    const newCommand = status === "on" || status === "open" ? "off" : "on";
    onToggle(
      newCommand === "off"
        ? deviceName.includes("Cửa")
          ? "close"
          : "off"
        : deviceName.includes("Cửa")
        ? "open"
        : "on"
    );
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg p-5 flex items-center justify-between">
      <div className="flex items-center">
        <div className="flex-shrink-0 rounded-md bg-indigo-500 p-3">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-5">
          <h3 className="text-lg font-medium text-gray-900">{deviceName}</h3>
          <p
            className={`text-sm ${
              status === "on" || status === "open"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            Status: {status === "on" || status === "open" ? "On" : "Off"}
          </p>
        </div>
      </div>
      <button
        onClick={handleToggle}
        className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
          ${
            status === "on" || status === "open"
              ? "bg-indigo-600"
              : "bg-gray-200"
          }
          ${!isToggleAllowed && "opacity-50 cursor-not-allowed"}
        `}
        disabled={!isToggleAllowed}
      >
        <span className="sr-only">Use setting</span>
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200
            ${
              status === "on" || status === "open"
                ? "translate-x-5"
                : "translate-x-0"
            }
          `}
        />
      </button>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const { socket } = useSocket();
  const [sensorData, setSensorData] = useState<{ [key: string]: SensorData }>(
    {}
  );
  const [deviceStatus, setDeviceStatus] = useState<{
    [key: string]: DeviceStatus;
  }>({});

  useEffect(() => {
    if (!socket) return;

    socket.on("sensorData", (data: SensorData) => {
      console.log("Received sensorData:", data);
      setSensorData((prev) => ({ ...prev, [data.type]: data }));
    });

    socket.on("deviceStatus", (data: DeviceStatus) => {
      console.log("Received deviceStatus:", data);
      setDeviceStatus((prev) => ({ ...prev, [data.name]: data }));
    });

    return () => {
      socket.off("sensorData");
      socket.off("deviceStatus");
    };
  }, [socket]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
  });

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
              Error loading dashboard data
            </h3>
          </div>
        </div>
      </div>
    );
  }

  const handleDeviceControl = async (
    deviceType: string,
    command: "on" | "off" | "open" | "close"
  ) => {
    try {
      const response = await api.post(`/mqtt/control/${deviceType}`, {
        command,
      });
      toast.success(`Device ${deviceType} turned ${command} successfully!`);
      // Update device status in state
      setDeviceStatus((prev) => ({
        ...prev,
        [deviceType]: { ...prev[deviceType], status: command },
      }));
    } catch (error) {
      toast.error(`Failed to turn ${deviceType} ${command}: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.name}! Here's what's happening with your smart
          home.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 mt-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Rooms"
          value={data?.totalRooms || 0}
          icon={Home}
          color="indigo"
        />
        <StatCard
          title="Total Devices"
          value={`${data?.activeDevices || 0}/${
            data?.totalDevices || 0
          } active`}
          icon={Lightbulb}
          color="green"
        />
        <StatCard
          title="Sensors"
          value={data?.totalSensors || 0}
          icon={BarChart3}
          color="yellow"
        />
        {user?.role === "ADMIN" && (
          <StatCard title="Users" value="Manage" icon={Users} color="purple" />
        )}
      </div>

      {/* Device Controls */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <DeviceControlCard
          deviceName="Cửa ra vào"
          status={deviceStatus["Cửa ra vào"]?.status || "off"}
          onToggle={(cmd) => handleDeviceControl("door", cmd)}
          icon={Home}
          allowedRoles={["ADMIN", "ADULT"]}
          userRole={user?.role}
        />
        <DeviceControlCard
          deviceName="Cửa gara"
          status={deviceStatus["Cửa gara"]?.status || "off"}
          onToggle={(cmd) => handleDeviceControl("garage", cmd)}
          icon={Home}
          allowedRoles={["ADMIN", "ADULT"]}
          userRole={user?.role}
        />
        <DeviceControlCard
          deviceName="Đèn LED"
          status={deviceStatus["LED"]?.status || "off"}
          onToggle={(cmd) => handleDeviceControl("led", cmd)}
          icon={Lightbulb}
          allowedRoles={["ADMIN", "ADULT", "CHILD"]}
          userRole={user?.role}
        />
        <DeviceControlCard
          deviceName="Quạt FAN"
          status={deviceStatus["FAN"]?.status || "off"}
          onToggle={(cmd) => handleDeviceControl("fan", cmd)}
          icon={Lightbulb} // Có thể thay bằng icon quạt
          allowedRoles={["ADMIN", "ADULT"]}
          userRole={user?.role}
        />
        <DeviceControlCard
          deviceName="Còi báo động"
          status={deviceStatus["BUZZER"]?.status || "off"}
          onToggle={(cmd) => handleDeviceControl("buzzer", cmd)}
          icon={Lightbulb} // Có thể thay bằng icon còi
          allowedRoles={["ADMIN", "ADULT"]}
          userRole={user?.role}
        />
      </div>

      {/* Sensor Data Display */}
      <div className="mt-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Sensor Readings
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Real-time data from your smart home sensors.
            </p>
          </div>
          <div className="divide-y divide-gray-200 p-4">
            {Object.entries(sensorData).map(([type, data]) => (
              <div key={type} className="flex justify-between py-2">
                <p className="text-sm font-medium text-gray-700">
                  {type.toUpperCase()}:
                </p>
                <p className="text-sm text-gray-900">
                  {data.value} {type === "gas" ? "ppm" : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Activity (Mock Data)
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Overview of recent activities in your smart home
            </p>
          </div>
          <div className="divide-y divide-gray-200">
            {data?.recentActivity.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      </div>

      {/* Role-based content */}
      {user?.role === "ADMIN" && (
        <div className="mt-8 bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-blue-800">Admin Controls</h3>
          <p className="mt-1 text-sm text-blue-700">
            Manage users, devices, and system settings from the admin panel.
          </p>
          <div className="mt-4">
            <Link
              to="/admin"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Admin Panel
            </Link>
          </div>
        </div>
      )}

      {user?.role === "CHILD" && (
        <div className="mt-8 bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-green-800">Kid's Controls</h3>
          <p className="mt-1 text-sm text-green-700">
            You can control basic devices in your room. Ask your parents for
            help with advanced settings.
          </p>
        </div>
      )}
    </div>
  );
}
