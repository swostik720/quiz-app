"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

import { getQuizCategories, startQuiz, submitQuiz } from "@/lib/api/quiz";
import { getApiErrorMessage } from "@/lib/api/client";
import { useQuizStore } from "@/store/quizStore";
import AppShell from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAppToast } from "@/components/ui/toaster";

const startQuizSchema = z.object({
  categoryId: z.string().min(1, "Please select a category"),
  count: z.coerce.number().int().min(1).max(20),
});

type StartQuizValues = z.infer<typeof startQuizSchema>;

export default function QuizPage() {
  const queryClient = useQueryClient();
  const { pushToast } = useAppToast();
  const { session, setSession, selectAnswer, goNext, goPrev, clearSession } = useQuizStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StartQuizValues>({
    resolver: zodResolver(startQuizSchema),
    defaultValues: { categoryId: "", count: 10 },
  });

  const categoriesQuery = useQuery({
    queryKey: ["quiz-categories"],
    queryFn: async () => {
      const data = await getQuizCategories();
      return data.categories;
    },
  });

  const startMutation = useMutation({
    mutationFn: ({ categoryId, count }: StartQuizValues) => startQuiz(categoryId, count),
    onSuccess: (data) => {
      setSession({
        categoryId: data.category.id,
        categoryTitle: data.category.title,
        questions: data.questions,
      });
      pushToast("Quiz started", "success");
    },
    onError: (error) => {
      pushToast(getApiErrorMessage(error, "Failed to start quiz"), "error");
    },
  });

  const submitMutation = useMutation({
    mutationFn: submitQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-quiz-results"] });
      pushToast("Quiz submitted successfully", "success");
    },
    onError: (error) => {
      pushToast(getApiErrorMessage(error, "Failed to submit quiz"), "error");
    },
  });

  const onStart = (values: StartQuizValues) => {
    startMutation.mutate(values);
  };

  const currentQuestion = session ? session.questions[session.currentIndex] : null;
  const selected = currentQuestion ? session?.selectedByQuestionId[currentQuestion.id] : undefined;

  const answeredCount = useMemo(() => {
    if (!session) return 0;
    return Object.keys(session.selectedByQuestionId).length;
  }, [session]);

  const submitDisabled = !session || answeredCount !== session.questions.length || submitMutation.isPending;

  const submitCurrentQuiz = () => {
    if (!session) return;

    submitMutation.mutate({
      categoryId: session.categoryId,
      answers: Object.entries(session.selectedByQuestionId).map(([questionId, answer]) => ({
        questionId,
        selected: answer,
      })),
    });
  };

  const activeError =
    categoriesQuery.error ||
    startMutation.error ||
    submitMutation.error;

  return (
    <AppShell>
      <Card>
        <CardHeader>
          <CardTitle>Play Quiz</CardTitle>
          <CardDescription>Choose a category and start the quiz.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeError && (
            <p className="text-sm text-destructive">{getApiErrorMessage(activeError, "Request failed")}</p>
          )}

          {!session && (
            <form onSubmit={handleSubmit(onStart)} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <select
                  id="categoryId"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  {...register("categoryId")}
                >
                  <option value="">Select category</option>
                  {(categoriesQuery.data ?? []).map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.title}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="count">Questions</Label>
                <input
                  id="count"
                  type="number"
                  min={1}
                  max={20}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  {...register("count", { valueAsNumber: true })}
                />
                {errors.count && <p className="text-sm text-destructive">{errors.count.message}</p>}
              </div>

              <div className="md:col-span-2">
                <Button type="submit" disabled={isSubmitting || startMutation.isPending}>
                  {startMutation.isPending ? "Starting..." : "Start Quiz"}
                </Button>
              </div>
            </form>
          )}

          {session && currentQuestion && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Category: {session.categoryTitle} · Question {session.currentIndex + 1}/{session.questions.length}
                </p>
                <p className="text-sm text-muted-foreground">Answered: {answeredCount}/{session.questions.length}</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{currentQuestion.question}</CardTitle>
                  <CardDescription>Difficulty: {currentQuestion.difficulty}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={`${currentQuestion.id}-${index}`}
                      type="button"
                      className={`w-full rounded-md border px-3 py-2 text-left text-sm ${selected === index ? "border-foreground bg-accent" : "border-input"}`}
                      onClick={() => selectAnswer(currentQuestion.id, index)}
                    >
                      {index + 1}. {option}
                    </button>
                  ))}
                </CardContent>
              </Card>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => goPrev()} disabled={session.currentIndex === 0}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => goNext()}
                  disabled={session.currentIndex >= session.questions.length - 1}
                >
                  Next
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    clearSession();
                    submitMutation.reset();
                  }}
                >
                  Cancel Quiz
                </Button>

                <Button onClick={submitCurrentQuiz} disabled={submitDisabled}>
                  {submitMutation.isPending ? "Submitting..." : "Submit Quiz"}
                </Button>
              </div>

              {submitMutation.data?.result && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Latest Result</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Badge variant="secondary">Correct: {submitMutation.data.result.correctCount}</Badge>
                      <Badge variant="destructive">Wrong: {submitMutation.data.result.wrongCount}</Badge>
                      <Badge>
                        Score: {submitMutation.data.result.score}/{submitMutation.data.result.total} ({submitMutation.data.result.percentage}%)
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {submitMutation.data.result.answerReview.map((answer) => (
                        <div key={answer.questionId} className="rounded-md border p-3">
                          <p className="text-sm font-medium">{answer.question}</p>
                          <p className={`mt-1 text-sm ${answer.isCorrect ? "text-green-600" : "text-destructive"}`}>
                            {answer.isCorrect ? "Correct" : "Wrong"} · Your answer: {answer.selectedOption}
                          </p>
                          {!answer.isCorrect && (
                            <p className="text-sm text-muted-foreground">Correct answer: {answer.correctOption}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link href="/results" className="text-sm text-foreground underline">
                        View full results history
                      </Link>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          clearSession();
                          submitMutation.reset();
                        }}
                      >
                        Start Another Quiz
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}