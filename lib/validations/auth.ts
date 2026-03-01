import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
});

export const loginSchema = z.object({
  email: z.email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
});

export const adminUpdateRoleSchema = z.object({
  userId: z.string().min(1, "User id is required"),
  role: z.enum(["user", "admin"]),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .max(100, "Password is too long"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type AdminUpdateRoleInput = z.infer<typeof adminUpdateRoleSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
