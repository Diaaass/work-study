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
  }): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: data,
    });
  },

  getMe(): Promise<User> {
    return apiClient<User>('/auth/me');
  },
};
