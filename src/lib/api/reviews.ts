import apiClient from './client';
import { ApiResponse, Review, SellerReviewSummary } from '@/types';

export const reviewsApi = {
  create: (sellerId: string, rating: number, comment?: string) =>
    apiClient.post<ApiResponse<Review>>(`/api/reviews/sellers/${sellerId}`, { rating, comment }),

  getForSeller: (sellerId: string) =>
    apiClient.get<ApiResponse<SellerReviewSummary>>(`/api/reviews/sellers/${sellerId}`),
};
