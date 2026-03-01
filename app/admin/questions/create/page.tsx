"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";

import AppShell from "@/components/AppShell";
import QuestionForm, { questionFormToPayload, type QuestionFormValues } from "@/components/admin/QuestionForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppToast } from "@/components/ui/toaster";
import { createAdminQuestion, getAdminCategories } from "@/lib/api/admin-quiz";
import { getApiErrorMessage } from "@/lib/api/client";

export default function CreateQuestionPage() {
  const router = useRouter();
  const { pushToast } = useAppToast();

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories", "for-question-create"],
    queryFn: async () => {
      const data = await getAdminCategories();
      return data.categories;
    },
  });

  const createMutation = useMutation({
    mutationFn: createAdminQuestion,
    onSuccess: () => {
      pushToast("Question created", "success");
      router.push("/admin/questions");
    },
    onError: (error) => {
      pushToast(getApiErrorMessage(error, "Failed to create question"), "error");
    },
  });

  const onSubmit = (values: QuestionFormValues) => {
    createMutation.mutate(questionFormToPayload(values));
  };

  return (
    <AppShell>
      <Card>
        <CardHeader>
          <CardTitle>Create Question</CardTitle>
          <CardDescription>Add a new quiz question.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(categoriesQuery.error || createMutation.error) && (
            <p className="text-sm text-destructive">
              {getApiErrorMessage(categoriesQuery.error ?? createMutation.error, "Request failed")}
            </p>
          )}

          {categoriesQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading categories...</p>
          ) : (
            <QuestionForm
              categories={categoriesQuery.data ?? []}
              onSubmit={onSubmit}
              submitLabel="Create Question"
              isSubmitting={createMutation.isPending}
            />
          )}

          <Link href="/admin/questions">
            <Button variant="outline">Back to Questions</Button>
          </Link>
        </CardContent>
      </Card>
    </AppShell>
  );
}
