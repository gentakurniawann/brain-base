import axios from '@/lib/axios';
import {
  IAnswer,
  IQuestion,
  IQuestionPayload,
  QuestionListResponse,
  MyQuestionsResponse,
  Response,
} from '@/types';
import { LeaderboardUser } from '@/types/menu/leaderboard';

export async function getQuestionsList(params?: {
  search?: string;
  status?: string;
  page?: number;
  page_size?: number;
}): Promise<QuestionListResponse> {
  try {
    const response = await axios.get<QuestionListResponse>('/questions', { params });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
}

export async function getDetailQuestions(id: string): Promise<IQuestion> {
  try {
    const response = await axios.get<IQuestion>(`/questions/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching question detail (ID: ${id}):`, error);
    throw error;
  }
}

export async function getMyQuestions(params?: {
  search?: string;
  status?: string;
  page?: number;
  page_size?: number;
}): Promise<MyQuestionsResponse> {
  try {
    const response = await axios.get('/questions/my', { params });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching my questions:', error);
    throw error;
  }
}

export async function getLeaderboard(): Promise<LeaderboardUser[]> {
  try {
    const response = await axios.get<LeaderboardUser[]>('/leaderboard');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
}

export async function createQuestion(data: IQuestionPayload): Promise<Response<IQuestion>> {
  try {
    const response = await axios.post('/questions', data);
    return response.data;
  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  }
}

export async function deleteQuestion(id: number): Promise<Response<IQuestion>> {
  try {
    const response = await axios.delete(`/questions/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting question with ID ${id}:`, error);
    throw error;
  }
}

export async function updateQuestion(
  data: IQuestionPayload,
  id: string,
): Promise<Response<IQuestion>> {
  try {
    const response = await axios.patch(`/questions/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
}

export async function validateQuestions(
  questionId: string,
  answerId: string,
): Promise<Response<IQuestion>> {
  try {
    const response = await axios.patch(`/questions/${questionId}/approve-answer/${answerId}`);
    return response.data;
  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  }
}

export async function getAnswerList(
  questionId: string,
  params?: {
    page?: number;
    page_size?: number;
  },
): Promise<IAnswer> {
  try {
    const response = await axios.get(`/answers/${questionId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching answers:', error);
    throw error;
  }
}

export async function createAnswer(data: {
  questionId: number;
  bodyMd: string;
}): Promise<Response<IAnswer>> {
  try {
    const response = await axios.post(`/answers/${data.questionId}`, {
      bodyMd: data.bodyMd,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating answer:', error);
    throw error;
  }
}

export async function updateAnswer(data: {
  questionId: number;
  answerId: number;
  bodyMd: string;
}): Promise<Response<IAnswer>> {
  try {
    const response = await axios.patch(`/answers/${data.questionId}/${data.answerId}`, {
      bodyMd: data.bodyMd,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating answer:', error);
    throw error;
  }
}

export async function deleteAnswer(
  questionId: number,
  answerId: number,
): Promise<Response<IAnswer>> {
  try {
    const response = await axios.delete(`/answers/${questionId}/${answerId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting answer:', error);
    throw error;
  }
}
