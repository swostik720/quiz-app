import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import { requireUserSession } from "@/lib/api-guards";
import Category from "@/models/Category";
import Question from "@/models/Questions";
import QuizAttempt from "@/models/QuizAttempts";
import User from "@/models/User";
import { attemptsQuerySchema } from "@/lib/validations/quiz";

type AttemptAnswer = {
  questionId: { toString: () => string };
  selected: number;
  correct: number;
};

export async function GET(req: Request) {
  const auth = await requireUserSession();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const url = new URL(req.url);
  const parsed = attemptsQuerySchema.safeParse({
    page: url.searchParams.get("page") ?? 1,
    limit: url.searchParams.get("limit") ?? 10,
    categoryId: url.searchParams.get("categoryId") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid query" },
      { status: 400 }
    );
  }

  await connectDB();

  const user = await User.findOne({ email: auth.session.user.email }).lean();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const filter: Record<string, unknown> = { userId: user._id };

  if (parsed.data.categoryId) {
    filter.categoryId = parsed.data.categoryId;
  }

  const skip = (parsed.data.page - 1) * parsed.data.limit;

  const [attempts, totalCount] = await Promise.all([
    QuizAttempt.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parsed.data.limit).lean(),
    QuizAttempt.countDocuments(filter),
  ]);

  const categoryIds = [...new Set(attempts.map((attempt) => attempt.categoryId.toString()))];
  const categories = await Category.find({ _id: { $in: categoryIds } }, { title: 1, slug: 1 }).lean();
  const categoryById = new Map(categories.map((category) => [category._id.toString(), category]));

  const questionIds = [
    ...new Set(
      attempts.flatMap((attempt) =>
        (attempt.answers as AttemptAnswer[]).map((answer) => answer.questionId.toString())
      )
    ),
  ];

  const questions = await Question.find(
    { _id: { $in: questionIds } },
    { question: 1, options: 1 }
  ).lean();
  const questionById = new Map(
    questions.map((question) => [
      question._id.toString(),
      {
        question: question.question,
        options: question.options,
      },
    ])
  );

  return NextResponse.json({
    page: parsed.data.page,
    limit: parsed.data.limit,
    totalCount,
    totalPages: Math.ceil(totalCount / parsed.data.limit),
    attempts: attempts.map((attempt) => {
      const category = categoryById.get(attempt.categoryId.toString());
      return {
        id: attempt._id.toString(),
        categoryId: attempt.categoryId.toString(),
        categoryTitle: category?.title ?? "Unknown",
        score: attempt.score,
        total: attempt.total,
        correctCount: attempt.score,
        wrongCount: Math.max(attempt.total - attempt.score, 0),
        percentage: Math.round((attempt.score / attempt.total) * 100),
        submittedAt: attempt.createdAt,
        answerReview: (attempt.answers as AttemptAnswer[]).map((answer) => {
          const question = questionById.get(answer.questionId.toString());
          const selectedOption = question?.options?.[answer.selected] ?? "Unknown";
          const correctOption = question?.options?.[answer.correct] ?? "Unknown";

          return {
            questionId: answer.questionId.toString(),
            question: question?.question ?? "Question unavailable",
            options: question?.options ?? [],
            selected: answer.selected,
            correct: answer.correct,
            selectedOption,
            correctOption,
            isCorrect: answer.selected === answer.correct,
          };
        }),
      };
    }),
  });
}