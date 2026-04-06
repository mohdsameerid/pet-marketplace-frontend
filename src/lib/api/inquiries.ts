import apiClient from './client';
import { ApiResponse, Inquiry, InquiryMessage } from '@/types';

export const inquiriesApi = {
  create: (listingId: string, initialMessage: string) =>
    apiClient.post<ApiResponse<Inquiry>>(`/api/inquiries/listings/${listingId}`, { initialMessage }),

  sendMessage: (inquiryId: string, message: string) =>
    apiClient.post<ApiResponse<InquiryMessage>>(`/api/inquiries/${inquiryId}/messages`, { message }),

  getById: (inquiryId: string) =>
    apiClient.get<ApiResponse<Inquiry>>(`/api/inquiries/${inquiryId}`),

  getForListing: (listingId: string) =>
    apiClient.get<ApiResponse<Inquiry[]>>(`/api/inquiries/listings/${listingId}`),

  getMyInquiries: () =>
    apiClient.get<ApiResponse<Inquiry[]>>('/api/inquiries/my-inquiries'),
};
