"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import AppShell from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminCategoryById } from "@/lib/api/admin-quiz";
import { getApiErrorMessage } from "@/lib/api/client";

export default function CategoryDetailsPage() {
  const params = useParams<{ id: string }>();
  const categoryId = params.id;

  const categoryQuery = useQuery({
    queryKey: ["admin-category", categoryId],
    queryFn: async () => getAdminCategoryById(categoryId),
    enabled: !!categoryId,
  });

  const category = categoryQuery.data;

  return (
    <AppShell>
      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
          <CardDescription>Inspect category information before editing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {categoryQuery.isLoading && <p className="text-sm text-muted-foreground">Loading category...</p>}

          {categoryQuery.error && (
            <p className="text-sm text-destructive">{getApiErrorMessage(categoryQuery.error, "Failed to load category")}</p>
          )}

          {!categoryQuery.isLoading && !category && (
            <p className="text-sm text-destructive">Category not found.</p>
          )}

          {category && (
            <div className="space-y-3 rounded-md border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">{category.title}</h2>
                <Badge variant={category.isActive ? "secondary" : "outline"}>
                  {category.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Slug: {category.slug}</p>
              <p className="text-sm">{category.description || "No description"}</p>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Image</p>
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={`${category.title} image`}
                    width={120}
                    height={120}
                    unoptimized
                    className="rounded border object-cover"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">None</p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Link href="/admin/categories">
              <Button variant="outline">Back</Button>
            </Link>
            {category && (
              <Link href={`/admin/categories/${category.id}/edit`}>
                <Button>Edit Category</Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
