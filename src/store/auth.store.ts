import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

type UserRole = 'ADMIN' | 'ADULT' | 'CHILD';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  mockLogin: (role?: UserRole) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: 'mock-jwt-token',
      user: {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'ADMIN' as UserRole,
      },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // This is a mock implementation
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // For demo purposes, accept any non-empty password
          if (!email || !password) {
            throw new Error('Email and password are required');
          }
          
          const mockToken = `mock-jwt-token-${Date.now()}`;
          set({
            token: mockToken,
            user: {
              id: '1',
              email,
              name: email.split('@')[0],
              role: email.includes('admin') ? 'ADMIN' : 'ADULT',
            },
            isAuthenticated: true,
          });
        } catch (error) {
          console.error('Login failed:', error);
          set({ error: error instanceof Error ? error.message : 'Login failed' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      mockLogin: (role: UserRole = 'ADMIN') => {
        const mockUser = {
          id: '1',
          email: `${role.toLowerCase()}@example.com`,
          name: `${role} User`,
          role,
        };
        
        set({
          token: `mock-jwt-token-${Date.now()}`,
          user: mockUser,
          isAuthenticated: true,
          error: null,
        });
      },
      
      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },
      
      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Export auth hook for easier access
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error } = useAuthStore();
  
  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    isAdmin: user?.role === 'ADMIN',
    isAdult: user?.role === 'ADULT',
    isChild: user?.role === 'CHILD',
  };
};
