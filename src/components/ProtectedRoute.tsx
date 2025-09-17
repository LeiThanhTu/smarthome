import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { UserRole } from "../types";
import { useEffect, useState } from "react";
import Spinner from "./Spinner";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles = [],
  children,
}) => {
  const { isAuthenticated, user, hasHydrated } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Only proceed if auth state is hydrated
    if (!hasHydrated) return;

    // If not authenticated, set unauthorized
    if (!isAuthenticated) {
      setIsAuthorized(false);
      setIsCheckingAuth(false);
      return;
    }

    // If no specific roles required, just check authentication
    if (allowedRoles.length === 0) {
      // Blocked users: disallow Devices page
      if (user?.isBlocked && location.pathname.startsWith("/devices")) {
        setIsAuthorized(false);
        setIsCheckingAuth(false);
        return;
      }
      setIsAuthorized(true);
      setIsCheckingAuth(false);
      return;
    }

    // Check if user has any of the required roles
    const hasRequiredRole = user && allowedRoles.includes(user.role);
    const blockedFromDevices =
      user?.isBlocked && location.pathname.startsWith("/devices");
    setIsAuthorized(!!hasRequiredRole && !blockedFromDevices);
    setIsCheckingAuth(false);
  }, [isAuthenticated, user, allowedRoles, hasHydrated]);

  // Show loading spinner while checking auth state
  if (isCheckingAuth || !hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
        <p className="ml-2 text-gray-600">Đang xác thực...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Store the attempted URL for redirecting after login
    const redirectUrl = location.pathname + location.search;
    return <Navigate to="/login" state={{ from: redirectUrl }} replace />;
  }

  // Show unauthorized message if user doesn't have required role
  if (isAuthorized === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Truy cập bị từ chối
          </h2>
          <p className="mb-6 text-gray-700">
            Bạn không có quyền truy cập trang này. Vui lòng đăng nhập với tài
            khoản có quyền phù hợp.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              Quay lại
            </button>
            <button
              onClick={() => {
                useAuthStore.getState().logout();
                navigate("/login");
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Đăng nhập lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render the protected content
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
