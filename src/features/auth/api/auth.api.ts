/**
 * Auth API
 *
 * React Query hooks for authentication operations.
 * Handles login, registration, and current user queries.
 *
 * @module features/auth/api/auth.api
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authConfig, buildAuthUrl } from '@/shared/config/auth.config';
import { useAuthStore, type User, type LoginCredentials, type RegisterData } from '../model/authStore';

interface TokenResponse {
  access_token: string;
  token_type: string;
}

interface ApiError {
  detail: string;
}

export function useLoginMutation() {
  const { setAuth, setLoading, setError } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<User> => {
      setLoading(true);

      const formData = new URLSearchParams();
      formData.append('username', credentials.email);
      formData.append('password', credentials.password);

      const loginResponse = await fetch(buildAuthUrl(authConfig.endpoints.login), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!loginResponse.ok) {
        const error: ApiError = await loginResponse.json();
        throw new Error(error.detail || 'Login failed');
      }

      const tokenData: TokenResponse = await loginResponse.json();

      const userResponse = await fetch(buildAuthUrl(authConfig.endpoints.me), {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user info');
      }

      const user: User = await userResponse.json();

      setAuth(user, tokenData.access_token);

      return user;
    },
    onSuccess: () => {
      setLoading(false);
      queryClient.invalidateQueries();
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });
}

export function useRegisterMutation() {
  const { setLoading, setError } = useAuthStore();

  return useMutation({
    mutationFn: async (data: RegisterData): Promise<User> => {
      setLoading(true);

      const response = await fetch(buildAuthUrl(authConfig.endpoints.register), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.detail || 'Registration failed');
      }

      const user: User = await response.json();
      setLoading(false);
      return user;
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });
}

export function useCurrentUserQuery() {
  const { token, isAuthenticated, setAuth, logout } = useAuthStore();

  return useQuery({
    queryKey: ['auth', 'me', token],
    queryFn: async (): Promise<User> => {
      const response = await fetch(buildAuthUrl(authConfig.endpoints.me), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
        }
        throw new Error('Failed to fetch user info');
      }

      const user: User = await response.json();
      if (token) {
        setAuth(user, token);
      }
      return user;
    },
    enabled: isAuthenticated && !!token,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return () => {
    logout();
    queryClient.clear();
  };
}
