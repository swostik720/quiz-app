"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import AppShell from "@/components/AppShell";
import CategoryForm, { type CategoryFormValues } from "@/components/admin/CategoryForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppToast } from "@/components/ui/toaster";
import { createAdminCategory } from "@/lib/api/admin-quiz";
import { getApiErrorMessage } from "@/lib/api/client";

export default function CreateCategoryPage() {
  const router = useRouter();
  const { pushToast } = useAppToast();

  const createMutation = useMutation({
    mutationFn: createAdminCategory,
    onSuccess: () => {
      pushToast("Category created", "success");
      router.push("/admin/categories");
    },
    onError: (error) => {
      pushToast(getApiErrorMessage(error, "Failed to create category"), "error");
    },
  });

  const onSubmit = (values: CategoryFormValues) => {
    createMutation.mutate(values);
  };

  return (
    <AppShell>
      <Card>
        <CardHeader>
          <CardTitle>Create Category</CardTitle>
          <CardDescription>Add a new quiz category.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {createMutation.error && (
            <p className="text-sm text-destructive">{getApiErrorMessage(createMutation.error, "Failed to create category")}</p>
          )}

          <CategoryForm
            onSubmit={onSubmit}
            submitLabel="Create Category"
            isSubmitting={createMutation.isPending}
          />

          <Link href="/admin/categories">
            <Button variant="outline">Back to Categories</Button>
          </Link>
        </CardContent>
      </Card>
    </AppShell>
  );
}
