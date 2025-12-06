import api from '../utils/api';
import { Answer } from './questionService';

export const answerService = {
  add: async (questionId: string, content: string): Promise<Answer> => {
    const response = await api.post<Answer>(`/answers/${questionId}/answers`, {
      content,
    });
    return response.data;
  },

  update: async (id: string, content: string): Promise<Answer> => {
    const response = await api.put<Answer>(`/answers/${id}`, {
      content,
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/answers/${id}`);
  },
};
