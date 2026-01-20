/**
 * Login Page
 *
 * Page component for user login.
 *
 * @module pages/login/LoginPage
 */

import { Navigate, useLocation } from 'react-router-dom';
import { LoginForm } from '@/features/auth';
import { authConfig } from '@/shared/config';

export function LoginPage() {
  const location = useLocation();

  if (!authConfig.enabled) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <LoginForm />
    </div>
  );
}
