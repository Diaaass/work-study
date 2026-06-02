import { apiClient } from './client';
import type { Internship } from '@/types/models';

export const bookmarksApi = {
  getAll(): Promise<Internship[]> {
    return apiClient<Internship[]>('/bookmarks');
  },

  getIds(): Promise<number[]> {
    return apiClient<number[]>('/bookmarks/ids');
  },

  toggle(internshipId: number): Promise<{ bookmarked: boolean }> {
    return apiClient<{ bookmarked: boolean }>(`/bookmarks/${internshipId}`, { method: 'POST' });
  },
};
