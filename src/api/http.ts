// src/api/http.ts
import axios from "axios";
// import type { AxiosRequestConfig, AxiosInstance } from "axios";
import { useAuthStore } from "../store/auth.store";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Request interceptor
// import type { InternalAxiosRequestConfig } from "axios";
api.interceptors.request.use(
  (config: any) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any)["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Request interceptor
// import type { InternalAxiosRequestConfig } from "axios";
// api.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     const token = useAuthStore.getState().token;
//     if (token) {
//       config.headers = config.headers || {};
//       (config.headers as any)["Authorization"] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// Response interceptor (basic, no refresh token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
