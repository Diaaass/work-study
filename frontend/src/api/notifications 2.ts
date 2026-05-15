import { apiClient } from './client';

export interface Notification {
  id: number;
  userId: number;
  type: 'new_application' | 'application_status' | 'moderation_result' | 'support_reply' | 'new_ticket' | 'new_internship';
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  items: Notification[];
  unreadCount: number;
}

export const notificationsApi = {
  getAll(): Promise<NotificationsResponse> {
    return apiClient<NotificationsResponse>('/notifications');
  },

  markRead(id: number): Promise<{ ok: boolean }> {
    return apiClient<{ ok: boolean }>(`/notifications/${id}/read`, { method: 'PATCH' });
  },

  markAllRead(): Promise<{ ok: boolean }> {
    return apiClient<{ ok: boolean }>('/notifications/read-all', { method: 'PATCH' });
  },
};
