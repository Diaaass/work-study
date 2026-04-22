import { apiClient } from './client';
import type { SupportTicket } from '@/types/models';

export const supportApi = {
  create(data: { subject: string; message: string }): Promise<SupportTicket> {
    return apiClient<SupportTicket>('/support', { method: 'POST', body: data });
  },

  getMy(): Promise<SupportTicket[]> {
    return apiClient<SupportTicket[]>('/support/my');
  },

  getAll(status?: string): Promise<SupportTicket[]> {
    const query = status ? `?status=${status}` : '';
    return apiClient<SupportTicket[]>(`/support${query}`);
  },

  reply(id: number, data: { adminReply?: string; status?: string }): Promise<SupportTicket> {
    return apiClient<SupportTicket>(`/support/${id}`, { method: 'PATCH', body: data });
  },
};
