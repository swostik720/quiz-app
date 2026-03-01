import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Dashboard() {
    const session = await getServerSession(authOptions);

    if (!session) redirect("/login");

    return (
        <AppShell>
            <Card>
                <CardHeader>
                    <CardTitle>Welcome back, {session.user.name}</CardTitle>
                    <CardDescription>Signed in as {session.user.role}. Pick what you want to do next.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <Link href="/quiz">
                        <Button className="w-full">Play Quiz</Button>
                    </Link>

                    <Link href="/results">
                        <Button variant="outline" className="w-full">My Results</Button>
                    </Link>

                    <Link href="/profile">
                        <Button variant="outline" className="w-full">Profile</Button>
                    </Link>

                    {session.user.role === "admin" && (
                        <Link href="/admin">
                            <Button className="w-full">Go to Admin Panel</Button>
                        </Link>
                    )}
                </CardContent>
            </Card>
        </AppShell>
    );
}