import apiClient from './client';
import { ApiResponse, Listing, PagedResult, ListingFilter, CreateListingRequest } from '@/types';

export const listingsApi = {
  getAll: (filters: ListingFilter) =>
    apiClient.get<ApiResponse<PagedResult<Listing>>>('/api/listings', { params: filters }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Listing>>(`/api/listings/${id}`),

  getMyListings: (pageNumber = 1, pageSize = 12) =>
    apiClient.get<ApiResponse<PagedResult<Listing>>>('/api/listings/my-listings', {
      params: { pageNumber, pageSize }
    }),

  create: (data: CreateListingRequest) =>
    apiClient.post<ApiResponse<Listing>>('/api/listings', data),

  update: (id: string, data: Partial<CreateListingRequest>) =>
    apiClient.put<ApiResponse<Listing>>(`/api/listings/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<object>>(`/api/listings/${id}`),

  submit: (id: string) =>
    apiClient.post<ApiResponse<Listing>>(`/api/listings/${id}/submit`),

  uploadImage: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<ApiResponse<{ id: string; imageUrl: string; isMain: boolean }>>(
      `/api/listings/${id}/images`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },

  deleteImage: (listingId: string, imageId: string) =>
    apiClient.delete<ApiResponse<object>>(`/api/listings/${listingId}/images/${imageId}`),

  setMainImage: (listingId: string, imageId: string) =>
    apiClient.put<ApiResponse<object>>(`/api/listings/${listingId}/images/${imageId}/set-main`),
};
