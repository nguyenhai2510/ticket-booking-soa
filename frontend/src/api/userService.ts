import axiosClient from './axiosClient';

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt?: string | null;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateUserPayload {
  username?: string;
  email?: string;
  role?: string;
}

export const userService = {
  getUsers: async (): Promise<User[]> => {
    return await axiosClient.get('/api/users');
  },

  getUserById: async (id: string): Promise<User> => {
    return await axiosClient.get(`/api/users/${id}`);
  },

  createUser: async (payload: CreateUserPayload): Promise<User> => {
    return await axiosClient.post('/api/users', payload);
  },

  updateUser: async (id: string, payload: UpdateUserPayload): Promise<User> => {
    return await axiosClient.put(`/api/users/${id}`, payload);
  },

  deleteUser: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/users/${id}`);
  },
};
