import { create } from 'zustand';
import { IQuestion } from '@/types';

interface IQuestionStore {
  modalAnswer: {
    open: boolean;
    answer: {
      bodyMd: string;
      id: number;
    } | null;
  };
  questions: IQuestion[];
  setModalAnswer: (open: boolean, answer: { bodyMd: string; id: number } | null) => void;
  setQuestions: (questions: IQuestion[]) => void;
}

const useQuestion = create<IQuestionStore>((set) => ({
  // state
  modalAnswer: {
    open: false,
    answer: null,
  },
  questions: [],

  // actions
  setModalAnswer: (open, answer) => set({ modalAnswer: { open, answer } }),
  setQuestions: (questions) => set({ questions }),
}));

export default useQuestion;
