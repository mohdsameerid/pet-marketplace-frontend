import axios, { AxiosError } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7093';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor — attach displayMessage and handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ errors?: string[]; message?: string }>) => {
    // Attach a human-readable message so callers can do:
    //   catch (err) => toast.error(err.displayMessage ?? 'Something went wrong')
    const displayMessage =
      error.response?.data?.errors?.[0] ??
      error.response?.data?.message ??
      error.message ??
      'Something went wrong';

    (error as AxiosError & { displayMessage: string }).displayMessage = displayMessage;

    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const isAuthEndpoint = error.config?.url?.includes('/api/auth/');
        if (!isAuthEndpoint) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
