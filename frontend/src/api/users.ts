import { apiClient } from './client';
import type { User, Internship } from '@/types/models';

export const usersApi = {
  getAll(): Promise<User[]> {
    return apiClient<User[]>('/users');
  },

  // Admin: toggle block/unblock a user
  update(id: number | string, _data: Partial<User>): Promise<User> {
    return apiClient<User>(`/users/${id}/block`, {
      method: 'PATCH',
    });
  },

  updateProfile(data: Partial<User>): Promise<User> {
    return apiClient<User>('/users/profile', {
      method: 'PATCH',
      body: data,
    });
  },

  // Moderation: get internships awaiting review
  getPendingInternships(): Promise<Internship[]> {
    return apiClient<Internship[]>('/internships?status=pending');
  },

  moderateInternship(
    id: string,
    _isApproved: boolean,
    status?: string,
    rejectionReason?: string,
  ): Promise<Internship> {
    return apiClient<Internship>(`/internships/${id}/moderate`, {
      method: 'PATCH',
      body: { status, rejectionReason },
    });
  },

  generateTelegramCode(): Promise<{ code: string; botUsername: string }> {
    return apiClient<{ code: string; botUsername: string }>('/users/telegram/generate-code', {
      method: 'POST',
    });
  },

  disconnectTelegram(): Promise<{ ok: boolean }> {
    return apiClient<{ ok: boolean }>('/users/telegram/disconnect', {
      method: 'DELETE',
    });
  },
};
