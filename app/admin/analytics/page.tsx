"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getAdminAnalytics } from "@/lib/api/admin-quiz";
import { getApiErrorMessage } from "@/lib/api/client";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState(30);

  const analyticsQuery = useQuery({
    queryKey: ["admin-quiz-analytics", days],
    queryFn: async () => getAdminAnalytics(days),
  });

  return (
    <AppShell>
      <Card>
        <CardHeader>
          <CardTitle>Quiz Analytics</CardTitle>
          <CardDescription>View attempts and score performance by category.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2">
            <Button variant={days === 7 ? "default" : "outline"} onClick={() => setDays(7)}>
              7 days
            </Button>
            <Button variant={days === 30 ? "default" : "outline"} onClick={() => setDays(30)}>
              30 days
            </Button>
            <Button variant={days === 90 ? "default" : "outline"} onClick={() => setDays(90)}>
              90 days
            </Button>
          </div>

          {analyticsQuery.isLoading && <p className="text-sm text-muted-foreground">Loading analytics...</p>}

          {analyticsQuery.error && (
            <p className="text-sm text-destructive">
              {getApiErrorMessage(analyticsQuery.error, "Failed to load analytics")}
            </p>
          )}

          {analyticsQuery.data && (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Total Attempts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold">{analyticsQuery.data.summary.attempts}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Average Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold">{analyticsQuery.data.summary.averageScorePercent}%</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <h2 className="text-base font-semibold">By Category</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Attempts</TableHead>
                      <TableHead>Avg Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyticsQuery.data.byCategory.map((item) => (
                      <TableRow key={item.categoryId}>
                        <TableCell>{item.categoryTitle}</TableCell>
                        <TableCell>{item.attempts}</TableCell>
                        <TableCell>{item.averageScorePercent}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-2">
                <h2 className="text-base font-semibold">Daily Trend</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Attempts</TableHead>
                      <TableHead>Avg Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyticsQuery.data.dailyTrend.map((item) => (
                      <TableRow key={item.date}>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>{item.attempts}</TableCell>
                        <TableCell>{item.averageScorePercent}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}