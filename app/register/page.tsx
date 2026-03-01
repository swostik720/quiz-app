"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";

import { registerUser } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/client";
import { registerSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppToast } from "@/components/ui/toaster";
import { useAuthStore } from "@/store/authStore";

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
    });
    const router = useRouter();
    const { pushToast } = useAppToast();
    const { notice, setNotice, clearNotice } = useAuthStore();

    const registerMutation = useMutation({
        mutationFn: registerUser,
        onSuccess: () => {
            setNotice({ type: "success", text: "Account created. Please login." });
            pushToast("Account created. Please login.", "success");
            router.push("/login");
        },
        onError: (error) => {
            const message = getApiErrorMessage(error, "Registration failed");
            setNotice({ type: "error", text: message });
            pushToast(message, "error");
        },
    });

    const onSubmit = async (data: RegisterFormValues) => {
        clearNotice();
        registerMutation.mutate(data);
    };

    return (
        <main className="container mx-auto flex min-h-[calc(100vh-2rem)] items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Create Account</CardTitle>
                    <CardDescription>Register a new account to get started.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full name</Label>
                            <Input id="fullName" {...register("fullName")} placeholder="John Doe" />
                            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
                        </div>
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

                        <Button className="w-full" type="submit" disabled={isSubmitting || registerMutation.isPending}>
                            {registerMutation.isPending ? "Creating account..." : "Register"}
                        </Button>

                        <p className="text-sm text-muted-foreground">
                            Already have account?{" "}
                            <Link href="/login" className="text-foreground hover:underline">
                                Login
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </main>
    )
}