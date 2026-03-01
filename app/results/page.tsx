"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getMyQuizResults } from "@/lib/api/quiz";
import { getApiErrorMessage } from "@/lib/api/client";
import AppShell from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResultsPage() {
  const [page, setPage] = useState(1);
  const [expandedAttemptIds, setExpandedAttemptIds] = useState<string[]>([]);

  const toggleAttemptDetails = (attemptId: string) => {
    setExpandedAttemptIds((prev) =>
      prev.includes(attemptId) ? prev.filter((id) => id !== attemptId) : [...prev, attemptId]
    );
  };

  const resultsQuery = useQuery({
    queryKey: ["my-quiz-results", page],
    queryFn: async () => getMyQuizResults({ page, limit: 10 }),
  });

  return (
    <AppShell>
      <Card>
        <CardHeader>
          <CardTitle>My Quiz Results</CardTitle>
          <CardDescription>Review scores and every right/wrong answer from your attempts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {resultsQuery.isLoading && <p className="text-sm text-muted-foreground">Loading results...</p>}

          {resultsQuery.error && (
            <p className="text-sm text-destructive">
              {getApiErrorMessage(resultsQuery.error, "Failed to load results")}
            </p>
          )}

          {resultsQuery.data && (
            <>
              <div className="space-y-4">
                {resultsQuery.data.attempts.map((attempt) => (
                  <Card key={attempt.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <CardTitle className="text-base">{attempt.categoryTitle}</CardTitle>
                          <CardDescription>{new Date(attempt.submittedAt).toLocaleString()}</CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAttemptDetails(attempt.id)}
                        >
                          {expandedAttemptIds.includes(attempt.id) ? "Hide details ↑" : "Show details ↓"}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <Badge>
                          Score: {attempt.score}/{attempt.total} ({attempt.percentage}%)
                        </Badge>
                        <Badge variant="secondary">Correct: {attempt.correctCount}</Badge>
                        <Badge variant="destructive">Wrong: {attempt.wrongCount}</Badge>
                      </div>

                      {expandedAttemptIds.includes(attempt.id) && (
                        <div className="space-y-2">
                          {attempt.answerReview.map((answer) => (
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
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {resultsQuery.data.page} of {resultsQuery.data.totalPages || 1}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={resultsQuery.data.totalPages <= page}
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}