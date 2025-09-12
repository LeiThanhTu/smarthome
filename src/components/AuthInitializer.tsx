import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useLocation, useNavigate } from 'react-router-dom';
import Spinner from './Spinner';

interface AuthInitializerProps {
  children: React.ReactNode;
}

export const AuthInitializer = ({ children }: AuthInitializerProps) => {
  const { hasHydrated, isAuthenticated, initialize } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      try {
        await initialize();
        
        // If user is not authenticated and trying to access protected route
        if (!isAuthenticated && location.pathname !== '/login' && location.pathname !== '/register') {
          navigate('/login', { 
            state: { from: location },
            replace: true 
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsReady(true);
      }
    };

    initAuth();
  }, [initialize, isAuthenticated, location, navigate]);

  // Show loading state while initializing
  if (!hasHydrated || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-2 text-gray-600">Đang tải ứng dụng...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthInitializer;
