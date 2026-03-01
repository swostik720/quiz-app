import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { error?: string })?.error ??
      error.message ??
      fallback
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
