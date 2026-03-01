import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import { requireAdminSession } from "@/lib/api-guards";
import QuizAttempt from "@/models/QuizAttempts";
import { analyticsQuerySchema } from "@/lib/validations/quiz";

export async function GET(req: Request) {
  const auth = await requireAdminSession();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const url = new URL(req.url);
  const parsed = analyticsQuerySchema.safeParse({
    days: url.searchParams.get("days") ?? 30,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid query" },
      { status: 400 }
    );
  }

  await connectDB();

  const fromDate = new Date(Date.now() - parsed.data.days * 24 * 60 * 60 * 1000);

  const [overall, byCategory, dailyTrend] = await Promise.all([
    QuizAttempt.aggregate([
      { $match: { createdAt: { $gte: fromDate } } },
      {
        $group: {
          _id: null,
          attempts: { $sum: 1 },
          totalScore: { $sum: "$score" },
          totalQuestions: { $sum: "$total" },
        },
      },
    ]),
    QuizAttempt.aggregate([
      { $match: { createdAt: { $gte: fromDate } } },
      {
        $group: {
          _id: "$categoryId",
          attempts: { $sum: 1 },
          totalScore: { $sum: "$score" },
          totalQuestions: { $sum: "$total" },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $project: {
          _id: 0,
          categoryId: "$_id",
          categoryTitle: { $ifNull: [{ $arrayElemAt: ["$category.title", 0] }, "Unknown"] },
          attempts: 1,
          averageScorePercent: {
            $cond: [
              { $eq: ["$totalQuestions", 0] },
              0,
              { $round: [{ $multiply: [{ $divide: ["$totalScore", "$totalQuestions"] }, 100] }, 2] },
            ],
          },
        },
      },
      { $sort: { attempts: -1 } },
    ]),
    QuizAttempt.aggregate([
      { $match: { createdAt: { $gte: fromDate } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          attempts: { $sum: 1 },
          totalScore: { $sum: "$score" },
          totalQuestions: { $sum: "$total" },
        },
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: {
                $dateFromParts: {
                  year: "$_id.year",
                  month: "$_id.month",
                  day: "$_id.day",
                },
              },
            },
          },
          attempts: 1,
          averageScorePercent: {
            $cond: [
              { $eq: ["$totalQuestions", 0] },
              0,
              { $round: [{ $multiply: [{ $divide: ["$totalScore", "$totalQuestions"] }, 100] }, 2] },
            ],
          },
        },
      },
      { $sort: { date: 1 } },
    ]),
  ]);

  const summary = overall[0] ?? { attempts: 0, totalScore: 0, totalQuestions: 0 };
  const averageScorePercent =
    summary.totalQuestions > 0 ? Number(((summary.totalScore / summary.totalQuestions) * 100).toFixed(2)) : 0;

  return NextResponse.json({
    rangeDays: parsed.data.days,
    summary: {
      attempts: summary.attempts,
      averageScorePercent,
    },
    byCategory: byCategory.map((item) => ({
      categoryId: item.categoryId.toString(),
      categoryTitle: item.categoryTitle,
      attempts: item.attempts,
      averageScorePercent: item.averageScorePercent,
    })),
    dailyTrend,
  });
}