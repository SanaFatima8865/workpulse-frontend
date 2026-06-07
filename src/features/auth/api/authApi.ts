import type { ApiResponse, UserProfile, AuthTokens } from '@workpulse/shared';

import { apiClient } from '@/lib/apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  workspaceName?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  bio?: string;
  jobTitle?: string;
  phone?: string;
  timezone?: string;
  language?: string;
  preferences?: Partial<UserProfile['preferences']>;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: RegisterPayload) =>
    apiClient
      .post<ApiResponse<AuthResponse>>('/auth/register', data)
      .then((r) => r.data),

  login: (data: LoginPayload) =>
    apiClient
      .post<ApiResponse<AuthResponse>>('/auth/login', data)
      .then((r) => r.data),

  logout: () =>
    apiClient.post<ApiResponse<null>>('/auth/logout').then((r) => r.data),

  logoutAll: () =>
    apiClient.post<ApiResponse<null>>('/auth/logout-all').then((r) => r.data),

  refreshToken: () =>
    apiClient
      .post<ApiResponse<AuthResponse>>('/auth/refresh')
      .then((r) => r.data),

  getMe: () =>
    apiClient
      .get<ApiResponse<UserProfile>>('/auth/me')
      .then((r) => r.data),

  updateProfile: (data: UpdateProfilePayload) =>
    apiClient
      .patch<ApiResponse<UserProfile>>('/auth/me', data)
      .then((r) => r.data),

  changePassword: (data: ChangePasswordPayload) =>
    apiClient
      .post<ApiResponse<null>>('/auth/change-password', data)
      .then((r) => r.data),

  checkAuth: () =>
    apiClient
      .get<ApiResponse<{ authenticated: boolean; userId: string; role: string }>>('/auth/check')
      .then((r) => r.data),
};
