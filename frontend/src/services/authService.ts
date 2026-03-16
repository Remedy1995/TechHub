import api from '../utils/api';

export interface User {
  _id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', {
      username,
      email,
      password,
    });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  // In your auth service file
  logout: async (token?: string): Promise<void> => {
    try {
      // If token is provided, use it in the headers, otherwise rely on the interceptor
      const config = token ? {
        headers: {
          Authorization: `Bearer ${token}`
        }
      } : undefined;
      
      await api.post('/auth/logout', null, config);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still resolve the promise even if the server call fails
      // to ensure the local logout always completes
    }
  },


  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};
