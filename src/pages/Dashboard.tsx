import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth.store";
import { Link } from "react-router-dom";
import { BarChart3, Home, Lightbulb, Clock, Users } from "lucide-react";

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

export default function Dashboard() {
  const { user } = useAuthStore();
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

      {/* Recent Activity */}
      <div className="mt-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Activity
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
