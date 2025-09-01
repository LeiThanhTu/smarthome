import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const loc = useLocation();
  if (!isAuthenticated)
    return <Navigate to="/login" state={{ from: loc }} replace />;
  return <Outlet />;
}
