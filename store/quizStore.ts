import { create } from "zustand";

import type { QuizQuestion } from "@/lib/api/quiz";

type QuizSession = {
  categoryId: string;
  categoryTitle: string;
  questions: QuizQuestion[];
  currentIndex: number;
  selectedByQuestionId: Record<string, number>;
};

interface QuizState {
  session: QuizSession | null;
  setSession: (payload: {
    categoryId: string;
    categoryTitle: string;
    questions: QuizQuestion[];
  }) => void;
  selectAnswer: (questionId: string, selected: number) => void;
  setCurrentIndex: (value: number) => void;
  goNext: () => void;
  goPrev: () => void;
  clearSession: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  session: null,
  setSession: ({ categoryId, categoryTitle, questions }) =>
    set({
      session: {
        categoryId,
        categoryTitle,
        questions,
        currentIndex: 0,
        selectedByQuestionId: {},
      },
    }),
  selectAnswer: (questionId, selected) =>
    set((state) => {
      if (!state.session) return state;

      return {
        session: {
          ...state.session,
          selectedByQuestionId: {
            ...state.session.selectedByQuestionId,
            [questionId]: selected,
          },
        },
      };
    }),
  setCurrentIndex: (value) =>
    set((state) => {
      if (!state.session) return state;

      const bounded = Math.max(0, Math.min(value, state.session.questions.length - 1));
      return {
        session: {
          ...state.session,
          currentIndex: bounded,
        },
      };
    }),
  goNext: () =>
    set((state) => {
      if (!state.session) return state;
      const next = Math.min(state.session.currentIndex + 1, state.session.questions.length - 1);
      return {
        session: {
          ...state.session,
          currentIndex: next,
        },
      };
    }),
  goPrev: () =>
    set((state) => {
      if (!state.session) return state;
      const prev = Math.max(state.session.currentIndex - 1, 0);
      return {
        session: {
          ...state.session,
          currentIndex: prev,
        },
      };
    }),
  clearSession: () => set({ session: null }),
}));