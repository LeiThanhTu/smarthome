import axios from "axios";
import { useAuthStore } from "../store/auth.store";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 responses
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

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  fullName: string;
  role: "ADMIN" | "ADULT" | "CHILD";
}

export const authApi = {
  async login(credentials: LoginCredentials) {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  async register(userData: RegisterData) {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  async getMe() {
    const response = await api.get("/auth/me");
    return response.data;
  },

  async refreshToken() {
    const response = await api.post("/auth/refresh-token");
    return response.data;
  },

  async logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      useAuthStore.getState().logout();
    }
  },
};

export default api;
