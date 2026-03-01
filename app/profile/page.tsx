"use client";

import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { changePassword } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/client";
import { getMyQuizResults } from "@/lib/api/quiz";
import AppShell from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppToast } from "@/components/ui/toaster";
import { changePasswordSchema } from "@/lib/validations/auth";

type ProfilePasswordValues = z.infer<typeof changePasswordSchema>;

export default function Profile() {
  const { data: session } = useSession();
  const { pushToast } = useAppToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfilePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const resultsQuery = useQuery({
    queryKey: ["profile-recent-results"],
    queryFn: async () => getMyQuizResults({ page: 1, limit: 5 }),
  });

  const attempts = resultsQuery.data?.attempts ?? [];
  const totalAttempts = resultsQuery.data?.totalCount ?? 0;
  const averagePercent = attempts.length
    ? Math.round(attempts.reduce((sum, item) => sum + item.percentage, 0) / attempts.length)
    : 0;

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: (data) => {
      pushToast(data.message, "success");
    },
    onError: (error) => {
      pushToast(getApiErrorMessage(error, "Failed to update password"), "error");
    },
  });

  const onSubmit = async (data: ProfilePasswordValues) => {
    mutation.mutate(data);
  };

  return (
    <AppShell>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
              <CardDescription>Quick summary of your account and quiz activity.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="text-xl font-semibold capitalize">{session?.user?.name ?? "user"}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total Attempts</p>
                  <p className="text-xl font-semibold">{totalAttempts}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Avg (Last 5)</p>
                  <p className="text-xl font-semibold">{averagePercent}%</p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Quiz History</CardTitle>
              <CardDescription>Your latest quiz attempts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {resultsQuery.isLoading && <p className="text-sm text-muted-foreground">Loading history...</p>}
              {resultsQuery.error && (
                <p className="text-sm text-destructive">{getApiErrorMessage(resultsQuery.error, "Failed to load history")}</p>
              )}

              {attempts.map((attempt) => (
                <div key={attempt.id} className="rounded-md border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{attempt.categoryTitle}</p>
                    <Badge>
                      {attempt.score}/{attempt.total} ({attempt.percentage}%)
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{new Date(attempt.submittedAt).toLocaleString()}</p>
                </div>
              ))}

              <Link href="/results">
                <Button variant="outline">View Complete Results</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Update your password and keep your account secure.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input id="currentPassword" type="password" {...register("currentPassword")} placeholder="Current password" />
                {errors.currentPassword && <p className="text-sm text-destructive">{errors.currentPassword.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input id="newPassword" type="password" {...register("newPassword")} placeholder="New password" />
                {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword.message}</p>}
              </div>

              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}