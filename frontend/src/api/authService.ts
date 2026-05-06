import axiosClient from './axiosClient';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  token?: string;
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
  message?: string;
}

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    return await axiosClient.post('/api/users/login', payload);
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    return await axiosClient.post('/api/users/register', payload);
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};
