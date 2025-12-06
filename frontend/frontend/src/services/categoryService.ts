import api from '../utils/api';

export interface Category {
  _id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },

  create: async (name: string, description: string): Promise<Category> => {
    const response = await api.post<Category>('/categories', {
      name,
      description,
    });
    return response.data;
  },
};
