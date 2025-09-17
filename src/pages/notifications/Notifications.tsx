import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "../../api/http";
import { useSocket } from "../../context/SocketContext";
import { useAuthStore } from "../../store/auth.store";
import type { DeviceRequestData } from "../../types/home.types";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { UserIcon, DeviceTabletIcon } from "@heroicons/react/20/solid";

export default function Notifications() {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const { user } = useAuthStore();

  const {
    data: requests = [],
    isLoading,
    error,
  } = useQuery<DeviceRequestData[], Error>({
    queryKey: ["deviceRequests"],
    queryFn: async () => {
      const response = await api.get("/devicerequests");
      return response.data;
    },
    enabled: user?.role === "ADMIN", // Chỉ kích hoạt query nếu là ADMIN
  });

  const approveRequestMutation = useMutation<any, Error, string>({
    mutationFn: (id) => api.patch(`/devicerequests/${id}/approve`),
    onSuccess: () => {
      toast.success("Yêu cầu đã được duyệt.");
      queryClient.invalidateQueries({ queryKey: ["deviceRequests"] });
    },
    onError: (err: any) => {
      toast.error(
        `Lỗi duyệt yêu cầu: ${err.response?.data?.message || err.message}`
      );
    },
  });

  const rejectRequestMutation = useMutation<any, Error, string>({
    mutationFn: (id) => api.patch(`/devicerequests/${id}/reject`),
    onSuccess: () => {
      toast.success("Yêu cầu đã bị từ chối.");
      queryClient.invalidateQueries({ queryKey: ["deviceRequests"] });
    },
    onError: (err: any) => {
      toast.error(
        `Lỗi từ chối yêu cầu: ${err.response?.data?.message || err.message}`
      );
    },
  });

  useEffect(() => {
    if (!socket || user?.role !== "ADMIN") return;

    socket.on(
      "deviceRequestAdminUpdate",
      (data: { requestId: string; status: string }) => {
        queryClient.invalidateQueries({ queryKey: ["deviceRequests"] });
        toast.info(
          `Trạng thái yêu cầu ${data.requestId} đã cập nhật thành ${data.status}.`
        );
      }
    );

    return () => {
      socket.off("deviceRequestAdminUpdate");
    };
  }, [socket, user, queryClient]);

  if (user?.role !== "ADMIN") {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-800">Truy cập bị từ chối</h2>
        <p className="mt-2 text-gray-600">
          Bạn không có quyền truy cập trang này.
        </p>
      </div>
    );
  }

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
        Lỗi tải yêu cầu: {error.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Quản lý Yêu cầu Thiết bị
      </h1>

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            Không có yêu cầu điều khiển thiết bị nào.
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Tất cả các yêu cầu đã được xử lý hoặc không có yêu cầu mới.
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
                  Người Yêu cầu
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
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
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
                      <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span>
                        {request.requester?.fullName ||
                          request.requester?.email}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      ({request.requester?.role})
                    </div>
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
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {request.status === "PENDING" && (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() =>
                            approveRequestMutation.mutate(request.id)
                          }
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Duyệt"
                          disabled={
                            approveRequestMutation.isPending ||
                            rejectRequestMutation.isPending
                          }
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() =>
                            rejectRequestMutation.mutate(request.id)
                          }
                          className="text-red-600 hover:text-red-900"
                          title="Từ chối"
                          disabled={
                            approveRequestMutation.isPending ||
                            rejectRequestMutation.isPending
                          }
                        >
                          <XCircleIcon className="h-5 w-5" />
                        </button>
                      </div>
                    )}
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
