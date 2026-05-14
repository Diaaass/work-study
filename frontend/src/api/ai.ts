import { apiClient } from './client';
import type { Internship } from '@/types/models';

export const aiApi = {
  getRecommendations: (city?: string): Promise<Internship[]> => {
    const params = city ? `?city=${encodeURIComponent(city)}` : '';
    return apiClient<Internship[]>(`/ai/recommendations${params}`);
  },

  getCoverLetter: (internshipId: number): Promise<{ text: string }> =>
    apiClient<{ text: string }>('/ai/cover-letter', { method: 'POST', body: { internshipId } }),

  smartSearch: (query: string, city?: string, workType?: string): Promise<Internship[]> =>
    apiClient<Internship[]>('/ai/smart-search', { method: 'POST', body: { query, city, workType } }),
};
