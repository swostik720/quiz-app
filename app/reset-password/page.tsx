"use client";

import { useForm } from "react-hook-form";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { resetPassword as resetPasswordApi } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppToast } from "@/components/ui/toaster";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { useAuthStore } from "@/store/authStore";

type ResetFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [token, setToken] = useState("");
  const [tokenChecked, setTokenChecked] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") ?? "");
    setTokenChecked(true);
  }, []);

  const schema = resetPasswordSchema.omit({ token: true });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Pick<ResetFormValues, "password">>({
    resolver: zodResolver(schema),
  });
  const { pushToast } = useAppToast();
  const { notice, setNotice, clearNotice } = useAuthStore();

  const resetMutation = useMutation({
    mutationFn: resetPasswordApi,
    onSuccess: (data) => {
      setNotice({ type: "success", text: data.message });
      pushToast(data.message, "success");
    },
    onError: (error) => {
      const message = getApiErrorMessage(error, "Failed to reset password");
      setNotice({ type: "error", text: message });
      pushToast(message, "error");
    },
  });

  const onSubmit = async (data: Pick<ResetFormValues, "password">) => {
    clearNotice();

    if (!token) {
      const message = "Invalid or missing reset token";
      setNotice({ type: "error", text: message });
      pushToast(message, "error");
      return;
    }

    resetMutation.mutate({ token, password: data.password });
  };

  return (
    <main className="container mx-auto flex min-h-[calc(100vh-2rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Create a new password for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input id="password" {...register("password")} type="password" placeholder="••••••••" />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            {tokenChecked && !token && <p className="text-sm text-destructive">Invalid or missing reset token</p>}
            {notice?.type === "success" && <p className="text-sm text-green-600">{notice.text}</p>}
            {notice?.type === "error" && <p className="text-sm text-destructive">{notice.text}</p>}

            <Button className="w-full" type="submit" disabled={isSubmitting || resetMutation.isPending || !tokenChecked || !token}>
              {resetMutation.isPending ? "Updating..." : "Reset Password"}
            </Button>

            <Link href="/login" className="inline-flex text-sm text-muted-foreground hover:text-foreground">
              ← Back
            </Link>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}