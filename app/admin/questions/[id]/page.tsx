"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import AppShell from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminCategories, getAdminQuestionById } from "@/lib/api/admin-quiz";
import { getApiErrorMessage } from "@/lib/api/client";

export default function QuestionDetailsPage() {
  const params = useParams<{ id: string }>();
  const questionId = params.id;

  const questionQuery = useQuery({
    queryKey: ["admin-question", questionId],
    queryFn: async () => getAdminQuestionById(questionId),
    enabled: !!questionId,
  });

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories", "for-question-details"],
    queryFn: async () => {
      const data = await getAdminCategories();
      return data.categories;
    },
  });

  const question = questionQuery.data;
  const categoryTitle = categoriesQuery.data?.find((item) => item.id === question?.categoryId)?.title ?? "Unknown";

  return (
    <AppShell>
      <Card>
        <CardHeader>
          <CardTitle>Question Details</CardTitle>
          <CardDescription>Review this question before editing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(questionQuery.error || categoriesQuery.error) && (
            <p className="text-sm text-destructive">
              {getApiErrorMessage(questionQuery.error ?? categoriesQuery.error, "Request failed")}
            </p>
          )}

          {(questionQuery.isLoading || categoriesQuery.isLoading) && (
            <p className="text-sm text-muted-foreground">Loading details...</p>
          )}

          {!questionQuery.isLoading && !question && (
            <p className="text-sm text-destructive">Question not found.</p>
          )}

          {question && (
            <div className="space-y-3 rounded-md border p-4">
              <p className="text-base font-medium">{question.question}</p>
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="secondary">Category: {categoryTitle}</Badge>
                <Badge variant="outline">Difficulty: {question.difficulty}</Badge>
                <Badge variant={question.isActive ? "secondary" : "outline"}>
                  {question.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="space-y-1">
                {question.options.map((option, index) => (
                  <p key={`${question.id}-${index}`} className="text-sm">
                    {index + 1}. {option} {index === question.correctAnswer ? "(Correct)" : ""}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Link href="/admin/questions">
              <Button variant="outline">Back</Button>
            </Link>
            {question && (
              <Link href={`/admin/questions/${question.id}/edit`}>
                <Button>Edit Question</Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
