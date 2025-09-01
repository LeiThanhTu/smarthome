// src/api/http.ts
import axios from "axios";
import type { AxiosRequestConfig, AxiosInstance } from "axios";
import { useAuthStore } from "../store/auth.store";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Create a mock axios instance that won't make actual HTTP requests
export const api = {
  get: async <T>(url: string): Promise<{ data: T }> => {
    console.warn(`Mock GET request to ${url}`);
    return { data: {} as T };
  },
  post: async <T>(url: string, data: any): Promise<{ data: T }> => {
    console.warn(`Mock POST request to ${url}`, data);
    return { data: {} as T };
  },
  patch: async <T>(url: string, data: any): Promise<{ data: T }> => {
    console.warn(`Mock PATCH request to ${url}`, data);
    return { data: {} as T };
  },
  delete: async (url: string): Promise<void> => {
    console.warn(`Mock DELETE request to ${url}`);
    return Promise.resolve();
  },
} as AxiosInstance;

// Request interceptor
import type { InternalAxiosRequestConfig } from "axios";
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
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       useAuthStore.getState().logout();
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );
