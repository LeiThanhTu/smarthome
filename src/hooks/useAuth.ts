import { useEffect } from "react";
import { useAuthStore, isAdmin, isAdult, isChild } from "../store/auth.store";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Hydrate store from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("auth-storage");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.state?.token) {
          useAuthStore.setState({
            token: parsed.state.token,
            user: parsed.state.user,
            isAuthenticated: true
          });
        }
      } catch (error) {
        console.error("Error parsing auth storage:", error);
      }
    }
  }, []);

  // Đảm bảo rằng isAuthenticated luôn được cập nhật chính xác
  const effectiveIsAuthenticated = isAuthenticated || (!!user && !!token);
  
  // Log trạng thái xác thực để debug
  useEffect(() => {
    console.log('Auth state:', { user, token, isAuthenticated: effectiveIsAuthenticated });
  }, [user, token, effectiveIsAuthenticated]);

  return {
    user,
    token,
    isAuthenticated: effectiveIsAuthenticated,
    logout,
    isAdmin: () => isAdmin(user),
    isAdult: () => isAdult(user),
    isChild: () => isChild(user)
  };
}
