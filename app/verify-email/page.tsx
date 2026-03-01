"use client";

import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppToast } from "@/components/ui/toaster";
import { verifyEmail } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/client";
import { useAuthStore } from "@/store/authStore";

export default function VerifyEmailPage() {
  const [token, setToken] = useState("");
  const [tokenChecked, setTokenChecked] = useState(false);
  const { pushToast } = useAppToast();
  const { notice, setNotice, clearNotice } = useAuthStore();

  const mutation = useMutation({
    mutationFn: verifyEmail,
    onSuccess: (data) => {
      setNotice({ type: "success", text: data.message });
      pushToast(data.message, "success");
    },
    onError: (error) => {
      const message = getApiErrorMessage(error, "Verification failed");
      setNotice({ type: "error", text: message });
      pushToast(message, "error");
    },
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const resolvedToken = (params.get("token") ?? "").trim();

    setToken(resolvedToken);
    setTokenChecked(true);
  }, []);

  useEffect(() => {
    if (!tokenChecked) return;

    if (!token && mutation.isIdle) {
      pushToast("Missing verification token", "error");
      return;
    }

    if (token && mutation.isIdle) {
      clearNotice();
      mutation.mutate({ token: token.trim() });
    }
  }, [token, tokenChecked, mutation, clearNotice, pushToast]);

  return (
    <main className="container mx-auto flex min-h-[calc(100vh-2rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify Email</CardTitle>
          <CardDescription>Click below to complete your account verification.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tokenChecked && !token && <p className="text-sm text-destructive">Missing verification token</p>}
          {notice?.type === "success" && <p className="text-sm text-green-600">{notice.text}</p>}
          {notice?.type === "error" && <p className="text-sm text-destructive">{notice.text}</p>}

          <Button
            className="w-full"
            disabled={mutation.isPending || !tokenChecked || !token}
            onClick={() => mutation.mutate({ token })}
          >
            {mutation.isPending ? "Verifying..." : "Verify Email"}
          </Button>

          <Link href="/login" className="inline-flex text-sm text-muted-foreground hover:text-foreground">
            ← Back to login
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
