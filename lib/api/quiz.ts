import { apiClient } from "@/lib/api/client";

export type QuizCategory = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  image?: string;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  difficulty: "easy" | "medium" | "hard";
};

export type QuizStartResponse = {
  category: {
    id: string;
    title: string;
    slug: string;
  };
  questions: QuizQuestion[];
};

export type QuizSubmitResponse = {
  message: string;
  result: {
    attemptId: string;
    categoryId: string;
    score: number;
    total: number;
    correctCount: number;
    wrongCount: number;
    percentage: number;
    answers: Array<{ questionId: string; selected: number; correct: number }>;
    answerReview: Array<{
      questionId: string;
      question: string;
      options: string[];
      selected: number;
      correct: number;
      selectedOption: string;
      correctOption: string;
      isCorrect: boolean;
    }>;
    submittedAt: string;
  };
};

export type QuizResultHistory = {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  attempts: Array<{
    id: string;
    categoryId: string;
    categoryTitle: string;
    score: number;
    total: number;
    correctCount: number;
    wrongCount: number;
    percentage: number;
    submittedAt: string;
    answerReview: Array<{
      questionId: string;
      question: string;
      options: string[];
      selected: number;
      correct: number;
      selectedOption: string;
      correctOption: string;
      isCorrect: boolean;
    }>;
  }>;
};

export async function getQuizCategories() {
  const { data } = await apiClient.get("/categories");
  return data as { categories: QuizCategory[] };
}

export async function startQuiz(categoryId: string, count = 10) {
  const { data } = await apiClient.get(`/quiz/start?categoryId=${categoryId}&count=${count}`);
  return data as QuizStartResponse;
}

export async function submitQuiz(payload: {
  categoryId: string;
  answers: Array<{ questionId: string; selected: number }>;
}) {
  const { data } = await apiClient.post("/quiz/submit", payload);
  return data as QuizSubmitResponse;
}

export async function getMyQuizResults(params?: { page?: number; limit?: number; categoryId?: string }) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.categoryId) query.set("categoryId", params.categoryId);

  const suffix = query.toString() ? `?${query.toString()}` : "";
  const { data } = await apiClient.get(`/quiz/results${suffix}`);
  return data as QuizResultHistory;
}