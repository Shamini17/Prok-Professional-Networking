import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

const AuthGuard: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and not on login/signup pages, redirect to login
  if (!isAuthenticated && !['/login', '/signup'].includes(location.pathname)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated and on login/signup pages, redirect to profile
  if (isAuthenticated && ['/login', '/signup'].includes(location.pathname)) {
    return <Navigate to="/profile" replace />;
  }

  // Render the child routes
  return <Outlet />;
};

export default AuthGuard; 