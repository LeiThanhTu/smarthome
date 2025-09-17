import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type UserRole = "ADMIN" | "ADULT" | "CHILD" | "GUEST";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatar?: string;
  dateOfBirth?: string;
  isBlocked?: boolean;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasHydrated: boolean;
  login: (data: { user: User; token: string }) => void;
  mockLogin: (role?: UserRole) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setHasHydrated: (state: boolean) => void;
  initialize: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void; // Thêm hành động cập nhật người dùng
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      hasHydrated: false,

      login: ({ user, token }) => {
        set({
          token,
          user,
          isAuthenticated: true,
          error: null,
          isLoading: false,
        });
      },

      mockLogin: (role: UserRole = "ADMIN") => {
        const mockUser = {
          id: `${Date.now()}`,
          email: `${role.toLowerCase()}@example.com`,
          fullName: `${role} User`,
          role,
          avatar: "/uploads/default-avatar.png",
          dateOfBirth: "2000-01-01",
          isBlocked: false,
        };
        const mockToken = `mock-token-${Date.now()}`;
        set({
          token: mockToken,
          user: mockUser,
          isAuthenticated: true,
          error: null,
          isLoading: false,
        });
        return { user: mockUser, token: mockToken };
      },

      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        localStorage.removeItem("auth-storage");
      },

      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),
      setHasHydrated: (state: boolean) => set({ hasHydrated: state }),

      initialize: async () => {
        // This function will be called after hydration
        set({ hasHydrated: true });
      },

      // Hành động mới để cập nhật thông tin người dùng
      updateUser: (userData: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : state.user,
        }));
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.initialize();
        }
      },
    }
  )
);

// Export helper functions
export const isAdmin = (user: User | null) => user?.role === "ADMIN";
export const isAdult = (user: User | null) => user?.role === "ADULT";
export const isChild = (user: User | null) => user?.role === "CHILD";
