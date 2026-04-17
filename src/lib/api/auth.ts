import apiClient from './client';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, User } from '@/types';

export interface UpdateProfileRequest {
  fullName: string;
  phoneNumber?: string;
  city?: string;
}

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>('/api/auth/login', data),

  register: (data: RegisterRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>('/api/auth/register', data),

  getMe: () =>
    apiClient.get<ApiResponse<User>>('/api/auth/me'),

  updateProfile: (data: UpdateProfileRequest) =>
    apiClient.put<ApiResponse<User>>('/api/auth/me', data),
};
