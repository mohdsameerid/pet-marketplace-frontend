import { User } from '@/types';

export const tokenUtils = {
  get: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  },

  set: (token: string): void => {
    localStorage.setItem('token', token);
  },

  remove: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isValid: (): boolean => {
    const token = tokenUtils.get();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },
};

export const userUtils = {
  get: (): User | null => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  set: (user: User): void => {
    localStorage.setItem('user', JSON.stringify(user));
  },
};
