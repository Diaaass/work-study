import { apiClient } from './client';
import type { Internship } from '@/types/models';

export const internshipsApi = {
  getAll(): Promise<Internship[]> {
    return apiClient<Internship[]>('/internships');
  },

  getRecommended(): Promise<Internship[]> {
    return apiClient<Internship[]>('/internships/recommended');
  },

  getById(id: string): Promise<Internship> {
    return apiClient<Internship>(`/internships/${id}`);
  },

  create(data: Partial<Internship>): Promise<Internship> {
    return apiClient<Internship>('/internships', {
      method: 'POST',
      body: data,
    });
  },

  getMy(): Promise<Internship[]> {
    return apiClient<Internship[]>('/internships/my');
  },

  update(id: string, data: Partial<Internship>): Promise<Internship> {
    return apiClient<Internship>(`/internships/${id}`, {
      method: 'PUT',
      body: data,
    });
  },
};
