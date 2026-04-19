import { apiClient } from './client';
import type { AuthResponse, User } from '@/types/models';

export const authApi = {
  login(email: string, password: string): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  register(data: {
    email: string;
    password: string;
    name: string;
    role: string;
    university?: string;
    major?: string;
    company?: string;
  }): Promise<{ email: string; autoVerified?: boolean }> {
    return apiClient<{ email: string; autoVerified?: boolean }>('/auth/register', {
      method: 'POST',
      body: data,
    });
  },

  verifyEmail(email: string, code: string): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/auth/verify-email', {
      method: 'POST',
      body: { email, code },
    });
  },

  resendCode(email: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>('/auth/resend-code', {
      method: 'POST',
      body: { email },
    });
  },

  getMe(): Promise<User> {
    return apiClient<User>('/auth/me');
  },

  forgotPassword(email: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  },

  resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: { email, code, newPassword },
    });
  },
};
