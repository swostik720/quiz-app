import { apiClient } from "@/lib/api/client";

export type AdminCategory = {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminQuestion = {
  id: string;
  categoryId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: "easy" | "medium" | "hard";
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminAnalytics = {
  rangeDays: number;
  summary: {
    attempts: number;
    averageScorePercent: number;
  };
  byCategory: Array<{
    categoryId: string;
    categoryTitle: string;
    attempts: number;
    averageScorePercent: number;
  }>;
  dailyTrend: Array<{
    date: string;
    attempts: number;
    averageScorePercent: number;
  }>;
};

export type AdminQuestionsListResponse = {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  questions: AdminQuestion[];
};

export async function getAdminCategories() {
  const { data } = await apiClient.get("/admin/categories");
  return data as { categories: AdminCategory[] };
}

export async function getAdminCategoryById(id: string) {
  const data = await getAdminCategories();
  return data.categories.find((category) => category.id === id) ?? null;
}

export async function createAdminCategory(payload: {
  title: string;
  slug?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
}) {
  const { data } = await apiClient.post("/admin/categories", payload);
  return data as { message: string; category: AdminCategory };
}

export async function updateAdminCategory(
  id: string,
  payload: {
    title: string;
    slug?: string;
    description?: string;
    image?: string;
    isActive?: boolean;
  }
) {
  const { data } = await apiClient.put(`/admin/categories/${id}`, payload);
  return data as { message: string; category: AdminCategory };
}

export async function deleteAdminCategory(id: string) {
  const { data } = await apiClient.delete(`/admin/categories/${id}`);
  return data as { message: string };
}

export async function getAdminQuestions(params?: {
  categoryId?: string;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.categoryId) query.set("categoryId", params.categoryId);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const suffix = query.toString() ? `?${query.toString()}` : "";
  const url = `/admin/questions${suffix}`;
  const { data } = await apiClient.get(url);
  return data as AdminQuestionsListResponse;
}

export async function getAdminQuestionById(id: string) {
  const { data } = await apiClient.get(`/admin/questions/${id}`);
  return (data as { question: AdminQuestion }).question;
}

export async function createAdminQuestion(payload: {
  categoryId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty?: "easy" | "medium" | "hard";
  isActive?: boolean;
}) {
  const { data } = await apiClient.post("/admin/questions", payload);
  return data as { message: string; question: AdminQuestion };
}

export async function updateAdminQuestion(
  id: string,
  payload: {
    categoryId: string;
    question: string;
    options: string[];
    correctAnswer: number;
    difficulty?: "easy" | "medium" | "hard";
    isActive?: boolean;
  }
) {
  const { data } = await apiClient.put(`/admin/questions/${id}`, payload);
  return data as { message: string; question: AdminQuestion };
}

export async function deleteAdminQuestion(id: string) {
  const { data } = await apiClient.delete(`/admin/questions/${id}`);
  return data as { message: string };
}

export async function getAdminAnalytics(days = 30) {
  const { data } = await apiClient.get(`/admin/analytics?days=${days}`);
  return data as AdminAnalytics;
}