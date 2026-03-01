"use client";

import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppToast } from "@/components/ui/toaster";
import { loginSchema } from "@/lib/validations/auth";
import { getApiErrorMessage } from "@/lib/api/client";
import { useAuthStore } from "@/store/authStore";

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });
    const router = useRouter();
    const searchParams = useSearchParams();
    const { pushToast } = useAppToast();
    const { notice, setNotice, clearNotice } = useAuthStore();

    useEffect(() => {
        if (searchParams.get("loggedOut") === "1") {
            pushToast("Logout successful", "success");
        }
    }, [searchParams, pushToast]);

    const loginMutation = useMutation({
        mutationFn: async (payload: LoginFormValues) => {
            const result = await signIn("credentials", {
                ...payload,
                redirect: false,
            });

            if (result?.error) {
                throw new Error(result.error);
            }

            return result;
        },
        onSuccess: () => {
            clearNotice();
            pushToast("Logged in successfully", "success");
            router.push("/dashboard");
        },
        onError: (error) => {
            const message = getApiErrorMessage(error, "Invalid email or password");
            setNotice({ type: "error", text: message });
            pushToast(message, "error");
        },
    });

    const onSubmit = async (data: LoginFormValues) => {
        clearNotice();
        loginMutation.mutate(data);
    };

    return (
        <main className="container mx-auto flex min-h-[calc(100vh-2rem)] items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>Welcome back. Continue to your account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" {...register("email")} placeholder="you@example.com" />
                            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" {...register("password")} type="password" placeholder="••••••••" />
                            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                        </div>

                        {notice?.type === "error" && (
                            <p className="text-sm text-destructive">
                                {notice.text}
                            </p>
                        )}
                        {notice?.type === "success" && (
                            <p className="text-sm text-green-600">
                                {notice.text}
                            </p>
                        )}

                        <Button className="w-full" type="submit" disabled={isSubmitting || loginMutation.isPending}>
                            {loginMutation.isPending ? "Logging in..." : "Login"}
                        </Button>

                        <div className="flex items-center justify-between text-sm">
                            <Link href="/forgot-password" className="text-muted-foreground hover:text-foreground">
                                Forgot password
                            </Link>
                            <Link href="/register" className="text-muted-foreground hover:text-foreground">
                                Create account
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </main>
    )
}