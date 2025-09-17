import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "../../api/http";
import { useSocket } from "../../context/SocketContext";
import { useAuthStore } from "../../store/auth.store";
import type { DeviceRequestData } from "../../types/home.types";
import { ClockIcon, DeviceTabletIcon } from "@heroicons/react/20/solid";

export default function MyRequests() {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const { user } = useAuthStore();

  const {
    data: requests = [],
    isLoading,
    error,
  } = useQuery<DeviceRequestData[], Error>({
    queryKey: ["myDeviceRequests"],
    queryFn: async () => {
      const response = await api.get("/users/requests");
      return response.data;
    },
    enabled: !!user?.id, // Chỉ kích hoạt query nếu user đã đăng nhập
  });

  useEffect(() => {
    if (!socket || !user?.id) return;

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
            `Yêu cầu điều khiển thiết bị ${data.deviceName} của bạn đã được duyệt!`
          );
        } else if (data.status === "REJECTED") {
          toast.error(
            `Yêu cầu điều khiển thiết bị ${
              data.deviceName || "của bạn"
            } đã bị từ chối.`
          );
        }
        queryClient.invalidateQueries({ queryKey: ["myDeviceRequests"] }); // Cập nhật danh sách yêu cầu
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

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 text-red-700 rounded-lg shadow">
        Lỗi tải yêu cầu của bạn: {error.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Yêu cầu điều khiển của tôi
      </h1>

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            Bạn chưa gửi yêu cầu điều khiển thiết bị nào.
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Hãy điều khiển thiết bị trên Dashboard hoặc Rooms để gửi yêu cầu.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ID Yêu cầu
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Thiết bị
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Trạng thái Yêu cầu
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Trạng thái mong muốn
                </th>
                {/* Removed Lời nhắn column */}
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Thời gian Yêu cầu
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <DeviceTabletIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span>{request.device?.name}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      ({request.device?.type})
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : request.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.requestedStatus}
                  </td>
                  {/* Removed message cell */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
