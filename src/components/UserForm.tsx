import { useForm } from "react-hook-form";
import type { User, UserCreate, UserUpdate, UserRole } from "../types/user";
import type { Room } from "../types/room";
import React, { useEffect, useState } from "react";
// import defaultAvatar from "../uploads/default-avatar.png";
import { Switch } from "@headlessui/react";

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:3000";

const DEFAULT_AVATAR_URL = `${API_BASE_URL}/uploads/default-avatar.png`;

export type UserFormData = {
  fullName?: string;
  email?: string;
  password?: string;
  role?: UserRole; // Làm cho vai trò tùy chọn để tương thích với UserUpdate
  avatar?: FileList | string;
  dateOfBirth?: string | Date;
  isBlocked?: boolean;
  roomIds?: string[];
};

interface UserFormProps {
  onSubmit: (data: UserCreate | UserUpdate) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  initialData?: User;
  rooms: Room[]; // Tất cả các phòng có sẵn để gán
}

export const UserForm: React.FC<UserFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting,
  initialData,
  rooms,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<UserFormData>({
    defaultValues: initialData
      ? {
          fullName: initialData.fullName,
          email: initialData.email,
          role: initialData.role,
          avatar: initialData.avatar?.startsWith("/uploads")
            ? `${API_BASE_URL}${initialData.avatar}`
            : initialData.avatar || DEFAULT_AVATAR_URL,
          dateOfBirth: initialData.dateOfBirth
            ? new Date(initialData.dateOfBirth).toISOString().split("T")[0]
            : undefined,
          isBlocked: initialData.isBlocked,
          roomIds: initialData.Rooms?.map((room) => room.id) || [],
        }
      : {
          fullName: "",
          email: "",
          password: "",
          role: "ADULT", // Mặc định là ADULT
          avatar: DEFAULT_AVATAR_URL,
          dateOfBirth: undefined,
          isBlocked: false,
          roomIds: [],
        },
  });

  const [previewAvatar, setPreviewAvatar] = useState<string | undefined>(
    initialData?.avatar?.startsWith("/uploads")
      ? `${API_BASE_URL}${initialData.avatar}`
      : initialData?.avatar || DEFAULT_AVATAR_URL
  );

  const avatarFile = watch("avatar"); // Watch for avatar file input changes

  useEffect(() => {
    if (avatarFile && avatarFile.length > 0 && avatarFile[0] instanceof File) {
      setPreviewAvatar(URL.createObjectURL(avatarFile[0]));
    } else if (initialData?.avatar?.startsWith("/uploads")) {
      setPreviewAvatar(`${API_BASE_URL}${initialData.avatar}`);
    } else if (initialData?.avatar) {
      setPreviewAvatar(initialData.avatar);
    } else {
      setPreviewAvatar(DEFAULT_AVATAR_URL);
    }
  }, [avatarFile, initialData]);

  useEffect(() => {
    if (initialData) {
      reset({
        fullName: initialData.fullName,
        email: initialData.email,
        role: initialData.role,
        avatar: initialData.avatar?.startsWith("/uploads")
          ? `${API_BASE_URL}${initialData.avatar}`
          : initialData.avatar || DEFAULT_AVATAR_URL,
        dateOfBirth: initialData.dateOfBirth
          ? new Date(initialData.dateOfBirth).toISOString().split("T")[0]
          : undefined,
        isBlocked: initialData.isBlocked,
        roomIds: initialData.Rooms?.map((room) => room.id) || [],
      });
      // setPreviewAvatar(initialData.avatar || defaultAvatar); // Handled by new useEffect
    } else {
      reset({
        fullName: "",
        email: "",
        password: "",
        role: "ADULT",
        avatar: DEFAULT_AVATAR_URL,
        dateOfBirth: undefined,
        isBlocked: false,
        roomIds: [],
      });
      // setPreviewAvatar(defaultAvatar); // Handled by new useEffect
    }
  }, [initialData, reset]);

  // const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files[0]) {
  //     const file = e.target.files[0];
  //     setPreviewAvatar(URL.createObjectURL(file));
  //     // TODO: Implement actual file upload to backend
  //   }
  // };

  const isBlocked = watch("isBlocked");
  const userRole = watch("role");

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
      <div className="flex flex-col items-center">
        <img
          src={previewAvatar}
          alt="Avatar Preview"
          className="h-24 w-24 rounded-full object-cover mb-4"
        />
        <input
          type="file"
          id="avatar"
          accept="image/*"
          {...register("avatar")}
          className="hidden"
        />
        <label
          htmlFor="avatar"
          className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Upload Avatar
        </label>
      </div>

      <div>
        <label
          htmlFor="fullName"
          className="block text-sm font-medium text-gray-700"
        >
          Full Name
        </label>
        <input
          type="text"
          id="fullName"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          {...register("fullName", {
            required: !initialData && "Full name is required",
          })}
        />
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          {...register("email", {
            required: !initialData && "Email is required",
          })}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {!initialData && (
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            {...register("password", {
              required: !initialData && "Password is required",
            })}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>
      )}

      <div>
        <label
          htmlFor="dateOfBirth"
          className="block text-sm font-medium text-gray-700"
        >
          Date of Birth (Optional)
        </label>
        <input
          type="date"
          id="dateOfBirth"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          {...register("dateOfBirth")}
        />
      </div>

      <div>
        <label
          htmlFor="role"
          className="block text-sm font-medium text-gray-700"
        >
          Role
        </label>
        <select
          id="role"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          {...register("role", {
            required: !initialData && "Role is required",
          })}
          disabled={initialData?.role === "ADMIN"} // Không cho phép chỉnh sửa vai trò ADMIN
        >
          <option value="ADMIN">Admin</option>
          <option value="ADULT">Adult</option>
          <option value="CHILD">Child</option>
          <option value="GUEST">Guest</option>
        </select>
        {errors.role && (
          <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
        )}
      </div>

      {(userRole === "ADULT" || userRole === "CHILD") && ( // Chỉ hiển thị nếu không phải ADMIN hoặc GUEST
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Room Access
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border p-2 rounded-md bg-gray-50">
            {rooms.length === 0 ? (
              <p className="text-sm text-gray-500 col-span-2">
                No rooms available.
              </p>
            ) : (
              rooms.map((room) => (
                <div key={room.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`room-${room.id}`}
                    value={room.id}
                    {...register("roomIds")}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    defaultChecked={initialData?.Rooms?.some(
                      (r) => r.id === room.id
                    )}
                  />
                  <label
                    htmlFor={`room-${room.id}`}
                    className="ml-2 text-sm text-gray-700"
                  >
                    {room.name}
                  </label>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {initialData && (
        <div>
          <label
            htmlFor="isBlocked"
            className="block text-sm font-medium text-gray-700"
          >
            Block User
          </label>
          <Switch
            checked={isBlocked || false}
            onChange={(checked) => reset({ ...watch(), isBlocked: checked })}
            className={`${
              isBlocked ? "bg-red-600" : "bg-gray-200"
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`}
          >
            <span className="sr-only">Toggle user block status</span>
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isBlocked ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </Switch>
          <p className="mt-1 text-sm text-gray-500">
            {isBlocked
              ? "User is blocked and cannot control devices."
              : "User is active."}
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : initialData
            ? "Save Changes"
            : "Add User"}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
