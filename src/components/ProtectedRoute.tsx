import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../store/auth.store';
import { UserRole } from '../types';
import { useEffect, useState } from 'react';
import Spinner from './Spinner';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles = [],
  children,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Skip if still loading or not authenticated
    if (isLoading || !isAuthenticated) {
      setIsAuthorized(false);
      return;
    }

    // If no specific roles required, just check authentication
    if (allowedRoles.length === 0) {
      setIsAuthorized(true);
      return;
    }

    // Check if user has any of the required roles
    const hasRequiredRole = user && allowedRoles.includes(user.role);
    setIsAuthorized(!!hasRequiredRole);
  }, [isAuthenticated, user, allowedRoles, isLoading]);

  // Show loading spinner while checking auth
  if (isLoading || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Show not authorized message if user doesn't have required role
  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-700 mb-6">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Render the child routes or the outlet
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
