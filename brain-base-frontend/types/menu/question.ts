import { ApiResponse } from '../global/api';
import { Meta } from '../theme';

export type QuestionListResponse = ApiResponse<IQuestion[]>;
export type QuestionDetailResponse = ApiResponse<IQuestion>;
export type MyQuestionsResponse = ApiResponse<IQuestion[]>;

export interface IQuestionStore {
  modalAnswer: boolean;
  setModalAnswer: (open: boolean) => void;
}

type Author = {
  id: string;
  name: string;
  email: string;
  primaryWallet: string;
};

export interface IQuestion {
  id: number;
  author: Author;
  isAuthor: boolean;
  authorId: number;
  title: string;
  bodyMd: string;
  ipfsCid: string;
  contentHash: string;
  status: 'Open' | 'Verified' | 'Cancelled';
  chainQId: number;
  txHash: string;
  bountyAmountWei: string;
  createdAt: string;
  updatedAt: string;
}

export interface IQuestionPayload {
  title?: string;
  bodyMd: string;
  bounty?: string;
  id?: string;
}

export interface IAnswer {
  questionId: number;
  total: number;
  answers: {
    id: number;
    questionId: number;
    authorId: number;
    bodyMd: string;
    ipfsCid: string;
    contentHash: string;
    isBest: boolean;
    isAuthor: boolean;
    chainAId: number;
    createdAt: string;
    author: Iauthor;
  }[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Iauthor {
  id: number;
  name: string;
  primaryWallet: string;
}
