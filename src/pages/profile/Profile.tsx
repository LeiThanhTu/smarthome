import { useEffect, useState } from "react";
import { UsersAPI } from "../../api/users.api";
import type { User } from "../../types/user";
import { useAuthStore } from "../../store/auth.store";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Input } from "../../components/Input"; 
import { Button } from "../../components/Button"; 

interface ProfileFormData {
  fullName: string;
  email: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        setError("Bạn chưa đăng nhập");
        setLoading(false);
        return;
      }

      try {
        const userData = await UsersAPI.getMe();
        setUser(userData);
        reset({
          fullName: userData.fullName,
          email: userData.email,
        });
        setError(null);
      } catch (err: any) {
        console.error("Lỗi khi lấy thông tin người dùng:", err);
        setError(
          err?.response?.data?.message || "Không thể lấy thông tin người dùng"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user?.id) {
      toast.error("Không tìm thấy ID người dùng để cập nhật.");
      return;
    }
    setIsUpdating(true);
    try {
      const updatedUserData = await UsersAPI.update(user.id.toString(), data);
      setUser(updatedUserData);
      toast.success("Cập nhật thông tin thành công!");
    } catch (err: any) {
      console.error("Lỗi khi cập nhật thông tin người dùng:", err);
      toast.error(
        err?.response?.data?.message || "Cập nhật thông tin thất bại."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div className="p-8">Đang tải...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!user)
    return <div className="p-8">Không tìm thấy thông tin người dùng</div>;

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
        Your Profile
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-gray-700"
          >
            Full Name
          </label>
          <Input
            id="fullName"
            type="text"
            {...register("fullName", { required: "Full Name is required" })}
            error={errors.fullName?.message}
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: /^\S+@\S+$/i,
            })}
            error={errors.email?.message}
            className="mt-1 block w-full"
            disabled // Email thường không được phép sửa trực tiếp
          />
        </div>
        <div className="text-gray-600 text-sm">
          <b>Role:</b> {user.role}
        </div>
        <div className="text-gray-600 text-sm">
          <b>ID:</b> {user.id}
        </div>
        <div>
          <Button
            type="submit"
            disabled={isUpdating}
            className="w-full justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isUpdating ? "Đang cập nhật..." : "Cập nhật thông tin"}
          </Button>
        </div>
      </form>
    </div>
  );
}
