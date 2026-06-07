import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';

import type { ApiResponse } from '@workpulse/shared';

import { useAppDispatch } from '@/store';
import { clearWorkspaces } from '@/store/workspaceSlice';
import { clearTeams } from '@/store/teamSlice';
import { clearBoards, clearTasks } from '@/store/boardSlice';
import { clearPresence } from '@/store/presenceSlice';
import {
  setCredentials,
  setAccessToken,
  logout as logoutAction,
  setAuthStatus,
  setInitialized,
} from '@/store/authSlice';
import { queryKeys } from '@/lib/queryClient';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { authApi } from '../api/authApi';
import type { RegisterPayload, LoginPayload, UpdateProfilePayload, ChangePasswordPayload } from '../api/authApi';

// ─── Get error message from Axios error ───────────────────────────────────────

const getErrorMessage = (error: unknown): string => {
  const axiosErr = error as AxiosError<ApiResponse>;
  if (axiosErr.response?.data?.message) {
    return axiosErr.response.data.message;
  }
  if (axiosErr.response?.data?.errors?.[0]?.message) {
    return axiosErr.response.data.errors[0].message;
  }
  return 'Something went wrong. Please try again.';
};

// ─── useRegister ──────────────────────────────────────────────────────────────

export const useRegister = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterPayload) => authApi.register(data),
    onSuccess: (response) => {
      const { user, accessToken } = response.data!;
      dispatch(setCredentials({ user, accessToken }));
      dispatch(setInitialized());
      connectSocket(accessToken);
      toast.success(`Welcome to WorkPulse, ${user.firstName}!`);
      navigate('/dashboard');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

// ─── useLogin ─────────────────────────────────────────────────────────────────

export const useLogin = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginPayload) => authApi.login(data),
    onSuccess: (response) => {
      const { user, accessToken } = response.data!;
      dispatch(setCredentials({ user, accessToken }));
      dispatch(setInitialized());

      // Pre-populate "me" cache
      queryClient.setQueryData(queryKeys.auth.me(), user);

      connectSocket(accessToken);
      toast.success(`Welcome back, ${user.firstName}!`);
      navigate('/dashboard');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

// ─── useLogout ────────────────────────────────────────────────────────────────

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      // Always clear state even if the API call fails
      dispatch(logoutAction());
      dispatch(clearWorkspaces());
      dispatch(clearTeams());
      dispatch(clearBoards());
      dispatch(clearTasks());
      dispatch(clearPresence());
      queryClient.clear();
      disconnectSocket();
      navigate('/auth/login');
    },
  });
};

// ─── useLogoutAll ─────────────────────────────────────────────────────────────

export const useLogoutAll = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logoutAll(),
    onSettled: () => {
      dispatch(logoutAction());
      queryClient.clear();
      disconnectSocket();
      toast.success('Logged out from all devices');
      navigate('/auth/login');
    },
  });
};

// ─── useGetMe ─────────────────────────────────────────────────────────────────

export const useGetMe = () => {
  const dispatch = useAppDispatch();

  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      const response = await authApi.getMe();
      const user = response.data!;
      // Keep Redux in sync
      const token = (window as unknown as { __wp_access_token?: string }).__wp_access_token;
      if (token) {
        dispatch(setCredentials({ user, accessToken: token }));
      }
      return user;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};

// ─── useUpdateProfile ─────────────────────────────────────────────────────────

export const useUpdateProfile = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfilePayload) => authApi.updateProfile(data),
    onSuccess: (response) => {
      const user = response.data!;
      // Update cache
      queryClient.setQueryData(queryKeys.auth.me(), user);
      // Partial update Redux
      const currentToken = (window as unknown as { __wp_access_token?: string }).__wp_access_token;
      if (currentToken) {
        dispatch(setCredentials({ user, accessToken: currentToken }));
      }
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

// ─── useChangePassword ────────────────────────────────────────────────────────

export const useChangePassword = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChangePasswordPayload) => authApi.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed. Please log in again.');
      dispatch(logoutAction());
      queryClient.clear();
      disconnectSocket();
      navigate('/auth/login');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

// ─── useInitAuth ──────────────────────────────────────────────────────────────
/**
 * Called once on app mount to silently restore the user session
 * by hitting /auth/refresh (uses the httpOnly cookie).
 */
export const useInitAuth = () => {
  const dispatch = useAppDispatch();

  const initialize = async () => {
    try {
      dispatch(setAuthStatus('loading'));
      const response = await authApi.refreshToken();
      const { user, accessToken } = response.data!;
      dispatch(setCredentials({ user, accessToken }));
      connectSocket(accessToken);
    } catch {
      // No valid session - user needs to log in
    } finally {
      dispatch(setInitialized());
    }
  };

  return { initialize };
};
