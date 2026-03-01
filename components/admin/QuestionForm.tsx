"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminCategory } from "@/lib/api/admin-quiz";

export const questionFormSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  question: z.string().trim().min(5, "Question must be at least 5 characters"),
  option0: z.string().trim().min(1, "Option 1 is required"),
  option1: z.string().trim().min(1, "Option 2 is required"),
  option2: z.string().trim().min(1, "Option 3 is required"),
  option3: z.string().trim().min(1, "Option 4 is required"),
  correctAnswer: z.number().int().min(0).max(3),
  difficulty: z.enum(["easy", "medium", "hard"]),
  isActive: z.boolean(),
});

export type QuestionFormValues = z.infer<typeof questionFormSchema>;

export const defaultQuestionValues: QuestionFormValues = {
  categoryId: "",
  question: "",
  option0: "",
  option1: "",
  option2: "",
  option3: "",
  correctAnswer: 0,
  difficulty: "easy",
  isActive: true,
};

export function questionFormToPayload(values: QuestionFormValues) {
  return {
    categoryId: values.categoryId,
    question: values.question,
    options: [values.option0, values.option1, values.option2, values.option3],
    correctAnswer: values.correctAnswer,
    difficulty: values.difficulty,
    isActive: values.isActive,
  };
}

type QuestionFormProps = {
  categories: AdminCategory[];
  initialValues?: QuestionFormValues;
  onSubmit: (values: QuestionFormValues) => void;
  submitLabel: string;
  isSubmitting?: boolean;
};

export default function QuestionForm({
  categories,
  initialValues = defaultQuestionValues,
  onSubmit,
  submitLabel,
  isSubmitting,
}: QuestionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    values: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="categoryId">Category</Label>
        <select
          id="categoryId"
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          {...register("categoryId")}
        >
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.title}
            </option>
          ))}
        </select>
        {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="question">Question</Label>
        <Input id="question" {...register("question")} />
        {errors.question && <p className="text-sm text-destructive">{errors.question.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="option0">Option 1</Label>
        <Input id="option0" {...register("option0")} />
        {errors.option0 && <p className="text-sm text-destructive">{errors.option0.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="option1">Option 2</Label>
        <Input id="option1" {...register("option1")} />
        {errors.option1 && <p className="text-sm text-destructive">{errors.option1.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="option2">Option 3</Label>
        <Input id="option2" {...register("option2")} />
        {errors.option2 && <p className="text-sm text-destructive">{errors.option2.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="option3">Option 4</Label>
        <Input id="option3" {...register("option3")} />
        {errors.option3 && <p className="text-sm text-destructive">{errors.option3.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="correctAnswer">Correct Option</Label>
        <select
          id="correctAnswer"
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          {...register("correctAnswer", { valueAsNumber: true })}
        >
          <option value={0}>Option 1</option>
          <option value={1}>Option 2</option>
          <option value={2}>Option 3</option>
          <option value={3}>Option 4</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="difficulty">Difficulty</Label>
        <select
          id="difficulty"
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          {...register("difficulty")}
        >
          <option value="easy">easy</option>
          <option value="medium">medium</option>
          <option value="hard">hard</option>
        </select>
      </div>

      <label className="flex items-center gap-2 md:col-span-2">
        <input type="checkbox" {...register("isActive")} />
        <span className="text-sm">Active</span>
      </label>

      <div className="md:col-span-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
