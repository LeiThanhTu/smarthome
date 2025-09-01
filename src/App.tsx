import React from "react";
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Rooms from './pages/rooms/Rooms';
import Devices from './pages/devices/Devices';
import Sensors from './pages/sensors/Sensors';
import Schedules from './pages/schedules/Schedules';
import Users from './pages/users/Users';
import NotFound from './pages/NotFound';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Admin and Adult routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'ADULT']} />}>
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/sensors" element={<Sensors />} />
              <Route path="/schedules" element={<Schedules />} />
            </Route>
            
            {/* Admin only routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/users" element={<Users />} />
            </Route>
            
            {/* Device routes for all authenticated users */}
            <Route path="/devices" element={<Devices />} />
            
            {/* 404 - Not Found */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
