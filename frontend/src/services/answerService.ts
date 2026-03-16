import api from '../utils/api';
import { User } from './authService';

export interface AnswerUser {
  _id: string;
  username: string;
  email: string;
}

export interface Answer {
  _id: string;
  content: string;
  user: AnswerUser | string;
  question: string;
  isAccepted: boolean;
  votes: number;
  createdAt: string;
  updatedAt: string;
}
export const answerService = {
  add: async (questionId: string, content: string): Promise<Answer> => {
    const response = await api.post<Answer>(`/api/questions/${questionId}/answers`, {
      content,
    });
    return response.data;
  },
  update: async (id: string, content: string): Promise<Answer> => {
    const response = await api.put<Answer>(`/api/answers/${id}`, { content });
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/answers/${id}`);
  },
  accept: async (id: string): Promise<Answer> => {
    const response = await api.patch<Answer>(`/api/answers/${id}/accept`);
    return response.data;
  }
}
