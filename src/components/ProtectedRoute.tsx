import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);

  // Add a small delay to prevent flash of loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Show loading state only after a short delay
  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-trackslip-blue"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login with the return location
  if (!user) {
    // Store the attempted URL for redirecting after login
    const from = location.pathname !== '/login' ? location.pathname + location.search : '/';
    return <Navigate to="/login" state={{ from }} replace />;
  }

  return <>{children}</>;
};
