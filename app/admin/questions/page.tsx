"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import AppShell from "@/components/AppShell";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppToast } from "@/components/ui/toaster";
import { deleteAdminQuestion, getAdminCategories, getAdminQuestions } from "@/lib/api/admin-quiz";
import { getApiErrorMessage } from "@/lib/api/client";

export default function AdminQuestionsPage() {
  const queryClient = useQueryClient();
  const { pushToast } = useAppToast();
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [deletingQuestion, setDeletingQuestion] = useState<{ id: string; question: string } | null>(null);

  const limit = 20;

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories", "for-questions"],
    queryFn: async () => {
      const data = await getAdminCategories();
      return data.categories;
    },
  });

  const questionsQuery = useQuery({
    queryKey: ["admin-questions", filterCategoryId || "all", page, limit],
    queryFn: async () => {
      return getAdminQuestions({
        categoryId: filterCategoryId || undefined,
        page,
        limit,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
      pushToast("Question deleted", "success");
      setDeletingQuestion(null);
    },
    onError: (error) => {
      pushToast(getApiErrorMessage(error, "Failed to delete question"), "error");
    },
  });

  return (
    <AppShell>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>Questions</CardTitle>
              <CardDescription>View, create, edit, and inspect question details.</CardDescription>
            </div>
            <Link href="/admin/questions/create">
              <Button>Create Question</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {(categoriesQuery.error || questionsQuery.error || deleteMutation.error) && (
            <p className="text-sm text-destructive">
              {getApiErrorMessage(
                categoriesQuery.error ?? questionsQuery.error ?? deleteMutation.error,
                "Request failed"
              )}
            </p>
          )}

          <div className="flex items-center gap-2">
            <Label htmlFor="filterCategory">Filter category</Label>
            <select
              id="filterCategory"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={filterCategoryId}
              onChange={(event) => {
                setFilterCategoryId(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All</option>
              {(categoriesQuery.data ?? []).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
          </div>

          {questionsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading questions...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(questionsQuery.data?.questions ?? []).map((question) => (
                  <TableRow key={question.id}>
                    <TableCell className="max-w-112.5 truncate">{question.question}</TableCell>
                    <TableCell>{question.difficulty}</TableCell>
                    <TableCell>{question.isActive ? "Active" : "Inactive"}</TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-2">
                        <Link href={`/admin/questions/${question.id}`}>
                          <Button size="sm" variant="outline">View</Button>
                        </Link>
                        <Link href={`/admin/questions/${question.id}/edit`}>
                          <Button size="sm" variant="outline">Edit</Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={deleteMutation.isPending}
                          onClick={() => setDeletingQuestion({ id: question.id, question: question.question })}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {questionsQuery.data && (
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                Page {questionsQuery.data.page} of {questionsQuery.data.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={page >= questionsQuery.data.totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deletingQuestion}
        title="Delete question?"
        description={
          deletingQuestion
            ? `This will remove "${deletingQuestion.question}". Please confirm.`
            : undefined
        }
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
        onCancel={() => setDeletingQuestion(null)}
        onConfirm={() => {
          if (!deletingQuestion) return;
          deleteMutation.mutate(deletingQuestion.id);
        }}
      />
    </AppShell>
  );
}
