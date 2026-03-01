import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="container mx-auto min-h-screen p-4 md:py-8">
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Hub Platform</CardTitle>
            <CardDescription>
              Practice quizzes, track your results, and manage categories/questions from one place.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Link href="/login" className="block">
              <Button className="w-full">Login</Button>
            </Link>
            <Link href="/register" className="block">
              <Button variant="outline" className="w-full">
                Register
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What you can do</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Start quizzes by category and submit instantly.</p>
            <p>• Review right/wrong answers after each attempt.</p>
            <p>• See complete result history with question-level details.</p>
            <p>• Admins can manage users, categories, questions, and analytics.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
