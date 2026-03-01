import { apiClient } from "@/lib/api/client";
import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "@/lib/validations/auth";

export async function registerUser(payload: RegisterInput) {
  const { data } = await apiClient.post("/register", payload);
  return data as { message: string };
}

export async function forgotPassword(payload: ForgotPasswordInput) {
  const { data } = await apiClient.post("/forgot-password", payload);
  return data as { message: string };
}

export async function resetPassword(payload: ResetPasswordInput) {
  const { data } = await apiClient.post("/reset-password", payload);
  return data as { message: string };
}

export async function verifyEmail(payload: VerifyEmailInput) {
  const { data } = await apiClient.post("/verify-email", payload);
  return data as { message: string };
}

export async function changePassword(payload: ChangePasswordInput) {
  const { data } = await apiClient.post("/profile/change-password", payload);
  return data as { message: string };
}
