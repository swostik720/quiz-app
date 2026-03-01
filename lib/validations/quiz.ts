import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const objectIdSchema = z
  .string()
  .trim()
  .regex(objectIdRegex, "Invalid id");

export const adminCategorySchema = z.object({
  title: z.string().trim().min(2, "Category title must be at least 2 characters"),
  description: z.string().trim().max(500, "Description is too long").optional().default(""),
  image: z.string().trim().optional().default(""),
  isActive: z.boolean().optional().default(true),
});

export const adminQuestionSchema = z.object({
  categoryId: objectIdSchema,
  question: z.string().trim().min(5, "Question must be at least 5 characters"),
  options: z.array(z.string().trim().min(1, "Option cannot be empty")).length(4),
  correctAnswer: z.number().int().min(0).max(3),
  difficulty: z.enum(["easy", "medium", "hard"]).optional().default("easy"),
  isActive: z.boolean().optional().default(true),
});

export const startQuizQuerySchema = z.object({
  categoryId: objectIdSchema,
  count: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export const submitQuizSchema = z.object({
  categoryId: objectIdSchema,
  answers: z
    .array(
      z.object({
        questionId: objectIdSchema,
        selected: z.number().int().min(0).max(3),
      })
    )
    .min(1, "At least one answer is required"),
});

export const attemptsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  categoryId: objectIdSchema.optional(),
});

export const analyticsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).optional().default(30),
});

export type AdminCategoryInput = z.infer<typeof adminCategorySchema>;
export type AdminQuestionInput = z.infer<typeof adminQuestionSchema>;
export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;