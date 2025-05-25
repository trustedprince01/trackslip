import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, initialized } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute:', { user, loading, initialized, path: location.pathname });

  // Show loading state while auth is initializing
  if (!initialized || loading) {
    console.log('ProtectedRoute: showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-trackslip-blue"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login with the return location
  if (!user) {
    console.log('ProtectedRoute: not authenticated, redirecting to login');
    // Store the attempted URL for redirecting after login
    const from = location.pathname !== '/login' ? location.pathname + location.search : '/';
    return <Navigate to="/login" state={{ from }} replace />;
  }

  console.log('ProtectedRoute: rendering children');
  return <>{children}</>;
};
