"use client";

import { useForm } from "react-hook-form";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";

import { forgotPassword } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/client";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppToast } from "@/components/ui/toaster";
import { useAuthStore } from "@/store/authStore";

type ForgotFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  const { pushToast } = useAppToast();
  const { notice, setNotice, clearNotice } = useAuthStore();

  const forgotMutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (data) => {
      setNotice({ type: "success", text: data.message });
      pushToast(data.message, "success");
    },
    onError: (error) => {
      const message = getApiErrorMessage(error, "Failed to send reset email");
      setNotice({ type: "error", text: message });
      pushToast(message, "error");
    },
  });

  const onSubmit = async (data: ForgotFormValues) => {
    clearNotice();
    forgotMutation.mutate(data);
  };

  return (
    <main className="container mx-auto flex min-h-[calc(100vh-2rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>Enter your email and we’ll send you a reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" {...register("email")} placeholder="you@example.com" />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            {notice?.type === "success" && <p className="text-sm text-green-600">{notice.text}</p>}
            {notice?.type === "error" && <p className="text-sm text-destructive">{notice.text}</p>}

            <Button className="w-full" type="submit" disabled={isSubmitting || forgotMutation.isPending}>
              {forgotMutation.isPending ? "Sending..." : "Send Reset Link"}
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