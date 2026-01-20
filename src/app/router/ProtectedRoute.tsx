/**
 * Protected Route
 *
 * Route guard that redirects unauthenticated users to /login.
 *
 * @module app/router/ProtectedRoute
 */
import { Navigate, useLocation } from 'react-router-dom';
import { authConfig } from '@/shared/config';
import { useAuthStore } from '@/features/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  if (!authConfig.enabled) {
    return children;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
