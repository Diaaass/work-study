import { apiClient } from './client';
import type { User, Internship } from '@/types/models';
import type { InternshipStatus } from '@/types/enums';

export const usersApi = {
  getAll(): Promise<User[]> {
    return apiClient<User[]>('/users');
  },

  update(id: string, data: Partial<User>): Promise<User> {
    return apiClient<User>(`/users/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  updateProfile(data: Partial<User>): Promise<User> {
    return apiClient<User>('/profile', {
      method: 'PUT',
      body: data,
    });
  },

  // Moderation
  getPendingInternships(): Promise<Internship[]> {
    return apiClient<Internship[]>('/moderation/pending');
  },

  moderateInternship(
    id: string,
    isApproved: boolean,
    status?: InternshipStatus,
  ): Promise<Internship> {
    return apiClient<Internship>(`/moderation/${id}`, {
      method: 'PUT',
      body: { isApproved, status },
    });
  },
};
