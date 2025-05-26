import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// Prevent caching of protected pages
const setNoCacheHeaders = () => {
  if (window.performance) {
    if (performance.navigation.type === 2) { // Navigation was triggered by back/forward button
      window.location.reload();
    }
  }
};

const ProtectedRoute: React.FC = () => {
  const { user, loading, initialized } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Add debug logging
    console.log('ProtectedRoute - Auth state:', { 
      user: !!user, 
      loading, 
      initialized,
      currentPath: location.pathname
    });
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', setNoCacheHeaders);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('popstate', setNoCacheHeaders);
    };
  }, [user, loading, initialized, location.pathname]);
  
  // Clear cache on component mount
  useEffect(() => {
    // Clean up any existing query parameters
    if (window.location.search) {
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, []);

  // Show loading state while initializing
  if (loading || !initialized) {
    console.log('ProtectedRoute - Showing loading state');
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If we have a user and initialization is complete, render the protected route
  console.log('ProtectedRoute - Rendering protected content');
  return <Outlet />;
};

export default ProtectedRoute;
