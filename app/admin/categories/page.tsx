"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import AppShell from "@/components/AppShell";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppToast } from "@/components/ui/toaster";
import { deleteAdminCategory, getAdminCategories } from "@/lib/api/admin-quiz";
import { getApiErrorMessage } from "@/lib/api/client";

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const { pushToast } = useAppToast();
  const [deletingCategory, setDeletingCategory] = useState<{ id: string; title: string } | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const data = await getAdminCategories();
      return data.categories;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      pushToast("Category deleted", "success");
      setDeletingCategory(null);
    },
    onError: (error) => {
      pushToast(getApiErrorMessage(error, "Failed to delete category"), "error");
    },
  });

  return (
    <AppShell>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>Categories</CardTitle>
              <CardDescription>View, create, edit, and inspect category details.</CardDescription>
            </div>
            <Link href="/admin/categories/create">
              <Button>Create Category</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {(categoriesQuery.error || deleteMutation.error) && (
            <p className="text-sm text-destructive">
              {getApiErrorMessage(categoriesQuery.error ?? deleteMutation.error, "Request failed")}
            </p>
          )}

          {categoriesQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading categories...</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {(categoriesQuery.data ?? []).map((category) => (
                <Card key={category.id} className="overflow-hidden">
                  <div className="h-40 w-full bg-muted">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.title}
                        width={640}
                        height={240}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <hr />
                  <CardContent className="space-y-3 pt-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-semibold">{category.title}</h3>
                      <Badge variant={category.isActive ? "secondary" : "outline"}>
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {category.description || "No description"}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <Link href={`/admin/categories/${category.id}`}>
                        <Button size="sm" variant="outline">View</Button>
                      </Link>
                      <Link href={`/admin/categories/${category.id}/edit`}>
                        <Button size="sm" variant="outline">Edit</Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={deleteMutation.isPending}
                        onClick={() => setDeletingCategory({ id: category.id, title: category.title })}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deletingCategory}
        title="Delete category?"
        description={
          deletingCategory
            ? `This will remove "${deletingCategory.title}". Please confirm.`
            : undefined
        }
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
        onCancel={() => setDeletingCategory(null)}
        onConfirm={() => {
          if (!deletingCategory) return;
          deleteMutation.mutate(deletingCategory.id);
        }}
      />
    </AppShell>
  );
}
