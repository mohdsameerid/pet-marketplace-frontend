import apiClient from './client';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, User } from '@/types';

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>('/api/auth/login', data),

  register: (data: RegisterRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>('/api/auth/register', data),

  getMe: () =>
    apiClient.get<ApiResponse<User>>('/api/auth/me'),
};
