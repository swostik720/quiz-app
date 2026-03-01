"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";

import AppShell from "@/components/AppShell";
import QuestionForm, {
  type QuestionFormValues,
  questionFormToPayload,
} from "@/components/admin/QuestionForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppToast } from "@/components/ui/toaster";
import {
  getAdminCategories,
  getAdminQuestionById,
  updateAdminQuestion,
} from "@/lib/api/admin-quiz";
import { getApiErrorMessage } from "@/lib/api/client";

export default function EditQuestionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const questionId = params.id;
  const { pushToast } = useAppToast();

  const questionQuery = useQuery({
    queryKey: ["admin-question", questionId],
    queryFn: async () => getAdminQuestionById(questionId),
    enabled: !!questionId,
  });

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories", "for-question-edit"],
    queryFn: async () => {
      const data = await getAdminCategories();
      return data.categories;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: ReturnType<typeof questionFormToPayload>) =>
      updateAdminQuestion(questionId, payload),
    onSuccess: () => {
      pushToast("Question updated", "success");
      router.push(`/admin/questions/${questionId}`);
    },
    onError: (error) => {
      pushToast(getApiErrorMessage(error, "Failed to update question"), "error");
    },
  });

  const question = questionQuery.data;

  const onSubmit = (values: QuestionFormValues) => {
    updateMutation.mutate(questionFormToPayload(values));
  };

  return (
    <AppShell>
      <Card>
        <CardHeader>
          <CardTitle>Edit Question</CardTitle>
          <CardDescription>Update question details and save changes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(questionQuery.error || categoriesQuery.error || updateMutation.error) && (
            <p className="text-sm text-destructive">
              {getApiErrorMessage(
                questionQuery.error ?? categoriesQuery.error ?? updateMutation.error,
                "Request failed"
              )}
            </p>
          )}

          {(questionQuery.isLoading || categoriesQuery.isLoading) && (
            <p className="text-sm text-muted-foreground">Loading data...</p>
          )}

          {question && categoriesQuery.data && (
            <QuestionForm
              categories={categoriesQuery.data}
              initialValues={{
                categoryId: question.categoryId,
                question: question.question,
                option0: question.options[0] ?? "",
                option1: question.options[1] ?? "",
                option2: question.options[2] ?? "",
                option3: question.options[3] ?? "",
                correctAnswer: question.correctAnswer,
                difficulty: question.difficulty,
                isActive: question.isActive,
              }}
              onSubmit={onSubmit}
              submitLabel="Save Changes"
              isSubmitting={updateMutation.isPending}
            />
          )}

          <Link href={`/admin/questions/${questionId}`}>
            <Button variant="outline">Back</Button>
          </Link>
        </CardContent>
      </Card>
    </AppShell>
  );
}
