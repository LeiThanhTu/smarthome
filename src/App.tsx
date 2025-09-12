import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Rooms from "./pages/rooms/Rooms";
import Devices from "./pages/devices/Devices";
import Sensors from "./pages/sensors/Sensors";
import Schedules from "./pages/schedules/Schedules";
import Users from "./pages/users/Users";
import NotFound from "./pages/NotFound";
import Profile from './pages/profile/Profile';
import TestAuth from "./pages/TestAuth";
import { AuthInitializer } from "./components/AuthInitializer";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const location = useLocation();
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        <Routes location={location} key={location.pathname}>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/test" element={<TestAuth />} />

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Admin and Adult routes */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN", "ADULT"]} />}>
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/schedules" element={<Schedules />} />
            </Route>

            {/* Admin only routes */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route path="/users" element={<Users />} />
            </Route>

            {/* Device routes for all authenticated users */}
            <Route path="/devices" element={<Devices />} />

            {/* Sensor routes for authenticated users with appropriate roles */}
            <Route path="/sensors" element={<Sensors />} />

            {/* Profile route for all authenticated users */}
            <Route path="/profile" element={<Profile />} />

            {/* 404 - Not Found */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthInitializer>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
