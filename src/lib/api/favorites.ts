import apiClient from './client';
import { ApiResponse, Favorite, PagedResult } from '@/types';

export const favoritesApi = {
  add: (listingId: string) =>
    apiClient.post<ApiResponse<object>>(`/api/favorites/${listingId}`),

  remove: (listingId: string) =>
    apiClient.delete<ApiResponse<object>>(`/api/favorites/${listingId}`),

  getMyFavorites: (pageNumber = 1, pageSize = 12) =>
    apiClient.get<ApiResponse<PagedResult<Favorite>>>('/api/favorites', {
      params: { pageNumber, pageSize }
    }),

  check: (listingId: string) =>
    apiClient.get<ApiResponse<boolean>>(`/api/favorites/${listingId}/check`),
};
