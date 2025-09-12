import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useNavigate } from 'react-router-dom';

export default function TestAuth() {
  const { user, isAuthenticated, logout, hasHydrated } = useAuthStore();
  const [status, setStatus] = useState('Loading...');
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasHydrated) {
      setStatus('Loading authentication state...');
      return;
    }

    if (isAuthenticated && user) {
      setStatus(`Authenticated as ${user.email} (${user.role})`);
    } else {
      setStatus('Not authenticated');
    }
  }, [isAuthenticated, user, hasHydrated]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Authentication Test</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 rounded">
            <h2 className="font-semibold mb-2">Status:</h2>
            <p className="font-mono">{status}</p>
          </div>

          {isAuthenticated && user && (
            <div className="p-4 bg-blue-50 rounded border border-blue-100">
              <h2 className="font-semibold mb-2">User Info:</h2>
              <div className="bg-white p-3 rounded text-sm">
                <p>Email: {user.email}</p>
                <p>Role: {user.role}</p>
                <p>ID: {user.id}</p>
              </div>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Go to Login
              </button>
            )}
            
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
