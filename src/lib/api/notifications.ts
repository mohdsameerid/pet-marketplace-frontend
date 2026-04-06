import apiClient from './client';
import { ApiResponse, Notification } from '@/types';

export const notificationsApi = {
  getAll: () =>
    apiClient.get<ApiResponse<Notification[]>>('/api/notifications'),

  getUnreadCount: () =>
    apiClient.get<ApiResponse<number>>('/api/notifications/unread-count'),

  markAsRead: (id: string) =>
    apiClient.put<ApiResponse<object>>(`/api/notifications/${id}/read`),

  markAllAsRead: () =>
    apiClient.put<ApiResponse<object>>('/api/notifications/read-all'),
};
