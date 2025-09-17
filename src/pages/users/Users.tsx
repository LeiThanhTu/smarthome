import { useState } from "react";
import Modal from "../../components/Modal";
import { UsersAPI } from "../../api/users.api";
import { RoomAPI } from "../../api/room.api";
import type { User, UserCreate, UserUpdate } from "../../types/user";
import type { Room } from "../../types/room";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserForm, type UserFormData } from "../../components/UserForm";
import { toast } from "react-toastify";
import {
  PencilIcon,
  TrashIcon,
  UserMinusIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "../../store/auth.store";

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:3000";

const DEFAULT_AVATAR_URL = `${API_BASE_URL}/uploads/default-avatar.png`;

export default function Users() {
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const queryClient = useQueryClient();
  const { user: currentUser, updateUser } = useAuthStore(); // Lấy user hiện tại và hàm updateUser

  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: UsersAPI.list,
    select: (data) =>
      data.map((user) => ({
        ...user,
        createdAt: new Date(user.createdAt!),
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : undefined,
      })),
  });

  const { data: rooms = [] } = useQuery<Room[]>({
    queryKey: ["rooms"],
    queryFn: RoomAPI.getAll,
    select: (allRooms) =>
      allRooms.filter(
        (room) =>
          !room.Users?.some((user) => user.role === "GUEST") &&
          !room.Users?.some((user) => user.role === "ADMIN")
      ),
  });

  const createUserMutation = useMutation({
    mutationFn: (userData: UserCreate | FormData) => {
      if (userData instanceof FormData) {
        return UsersAPI.create(userData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      return UsersAPI.create(userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully!");
      setIsAddEditModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create user.");
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserUpdate | FormData }) => {
      if (data instanceof FormData) {
        return UsersAPI.update(id, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      return UsersAPI.update(id, data);
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully!");
      setIsAddEditModalOpen(false);
      setEditingUser(undefined);
      if (currentUser && updatedUser.id === currentUser.id) {
        updateUser({ avatar: updatedUser.avatar });
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update user.");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => UsersAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete user.");
    },
  });

  const blockUnblockUserMutation = useMutation({
    mutationFn: ({ id, isBlocked }: { id: string; isBlocked: boolean }) =>
      UsersAPI.update(id, { isBlocked }),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(
        `User ${updatedUser.isBlocked ? "blocked" : "unblocked"} successfully!`
      );
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message || "Failed to change block status."
      );
    },
  });

  const handleAddUser = () => {
    setEditingUser(undefined);
    setIsAddEditModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsAddEditModalOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleBlockUnblockUser = (userId: string, currentStatus: boolean) => {
    blockUnblockUserMutation.mutate({ id: userId, isBlocked: !currentStatus });
  };

  const onUserFormSubmit = (data: UserFormData) => {
    const isAvatarFileUpload = data.avatar && data.avatar[0] instanceof File;

    let payload: UserCreate | UserUpdate | FormData;

    if (isAvatarFileUpload) {
      const formData = new FormData();
      if (data.fullName) formData.append("fullName", data.fullName);
      if (data.email) formData.append("email", data.email);
      if (data.password) formData.append("password", data.password);
      if (data.role) formData.append("role", data.role);
      if (data.dateOfBirth) {
        formData.append(
          "dateOfBirth",
          data.dateOfBirth instanceof Date
            ? data.dateOfBirth.toISOString().split("T")[0]
            : data.dateOfBirth
        );
      }
      if (typeof data.isBlocked === "boolean")
        formData.append("isBlocked", String(data.isBlocked));
      if (data.roomIds && data.roomIds.length > 0) {
        data.roomIds.forEach((id) => formData.append("roomIds[]", id));
      }
      if (
        data.avatar &&
        data.avatar instanceof FileList &&
        data.avatar.length > 0
      ) {
        formData.append("avatar", data.avatar[0]);
      }
      payload = formData;
    } else {
      // For non-file updates, send as JSON
      payload = {
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        dateOfBirth:
          data.dateOfBirth instanceof Date
            ? data.dateOfBirth.toISOString().split("T")[0]
            : data.dateOfBirth,
        isBlocked: data.isBlocked,
        roomIds: data.roomIds,
      };
      // Only add password if it's a new user creation
      if (!editingUser && data.password) {
        (payload as UserCreate).password = data.password;
      }
    }

    if (editingUser) {
      updateUserMutation.mutate({
        id: editingUser.id,
        data: payload,
      });
    } else {
      createUserMutation.mutate(payload as UserCreate | FormData);
    }
  };

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div>Error loading users</div>;
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your smart home users and their permissions.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleAddUser}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add New Member
          </button>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                  >
                    Avatar
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Date of Birth
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Rooms
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Join Date
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Status
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={`${
                          user.avatar?.startsWith("/uploads")
                            ? `${API_BASE_URL}${user.avatar}`
                            : user.avatar || DEFAULT_AVATAR_URL
                        }?t=${Date.now()}`}
                        alt=""
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {user.fullName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {user.dateOfBirth instanceof Date &&
                      !isNaN(user.dateOfBirth.getTime())
                        ? user.dateOfBirth.toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {user.role === "ADMIN"
                        ? "Tất cả các phòng"
                        : (user.Rooms || [])
                            .map((room) => room.name)
                            .join(", ") || "No rooms assigned"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          user.role === "ADMIN"
                            ? "bg-red-50 text-red-700 ring-red-600/20"
                            : user.role === "ADULT"
                            ? "bg-blue-50 text-blue-700 ring-blue-600/20"
                            : user.role === "CHILD"
                            ? "bg-green-50 text-green-700 ring-green-600/20"
                            : "bg-gray-50 text-gray-700 ring-gray-600/20"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {user.createdAt instanceof Date &&
                      !isNaN(user.createdAt.getTime())
                        ? user.createdAt.toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          user.isBlocked
                            ? "bg-red-50 text-red-700 ring-red-600/20"
                            : "bg-green-50 text-green-700 ring-green-600/20"
                        }`}
                      >
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit User"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        {user.role !== "ADMIN" && ( // ADMIN không thể tự block/delete
                          <>
                            <button
                              onClick={() =>
                                handleBlockUnblockUser(
                                  user.id,
                                  user.isBlocked || false
                                )
                              }
                              className={`${
                                user.isBlocked
                                  ? "text-green-600"
                                  : "text-red-600"
                              } hover:text-gray-900`}
                              title={
                                user.isBlocked ? "Unblock User" : "Block User"
                              }
                            >
                              {user.isBlocked ? (
                                <UserPlusIcon className="h-5 w-5" />
                              ) : (
                                <UserMinusIcon className="h-5 w-5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete User"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={editingUser ? "Edit User" : "Add New Member"}
        description={
          editingUser
            ? "Update the user's details and permissions."
            : "Add a new family member to your smart home."
        }
      >
        <UserForm
          onSubmit={onUserFormSubmit}
          onCancel={() => setIsAddEditModalOpen(false)}
          isSubmitting={
            createUserMutation.status === "pending" ||
            updateUserMutation.status === "pending"
          }
          initialData={editingUser}
          rooms={rooms}
        />
      </Modal>
    </div>
  );
}
