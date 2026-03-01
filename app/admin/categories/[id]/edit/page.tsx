"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";

import AppShell from "@/components/AppShell";
import CategoryForm, { type CategoryFormValues } from "@/components/admin/CategoryForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppToast } from "@/components/ui/toaster";
import { getAdminCategoryById, updateAdminCategory } from "@/lib/api/admin-quiz";
import { getApiErrorMessage } from "@/lib/api/client";

export default function EditCategoryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const categoryId = params.id;
  const { pushToast } = useAppToast();

  const categoryQuery = useQuery({
    queryKey: ["admin-category", categoryId],
    queryFn: async () => getAdminCategoryById(categoryId),
    enabled: !!categoryId,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: CategoryFormValues) => updateAdminCategory(categoryId, payload),
    onSuccess: () => {
      pushToast("Category updated", "success");
      router.push(`/admin/categories/${categoryId}`);
    },
    onError: (error) => {
      pushToast(getApiErrorMessage(error, "Failed to update category"), "error");
    },
  });

  const category = categoryQuery.data;

  const onSubmit = (values: CategoryFormValues) => {
    updateMutation.mutate(values);
  };

  return (
    <AppShell>
      <Card>
        <CardHeader>
          <CardTitle>Edit Category</CardTitle>
          <CardDescription>Update this category and save changes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {categoryQuery.isLoading && <p className="text-sm text-muted-foreground">Loading category...</p>}

          {(categoryQuery.error || updateMutation.error) && (
            <p className="text-sm text-destructive">
              {getApiErrorMessage(categoryQuery.error ?? updateMutation.error, "Request failed")}
            </p>
          )}

          {category && (
            <CategoryForm
              initialValues={{
                title: category.title,
                description: category.description,
                image: category.image,
                isActive: category.isActive,
              }}
              onSubmit={onSubmit}
              submitLabel="Save Changes"
              isSubmitting={updateMutation.isPending}
            />
          )}

          <div className="flex gap-2">
            <Link href={`/admin/categories/${categoryId}`}>
              <Button variant="outline">Back</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
