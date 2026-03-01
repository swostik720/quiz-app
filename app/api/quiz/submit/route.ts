import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import { requireUserSession } from "@/lib/api-guards";
import Category from "@/models/Category";
import Question from "@/models/Questions";
import QuizAttempt from "@/models/QuizAttempts";
import User from "@/models/User";
import { submitQuizSchema } from "@/lib/validations/quiz";

export async function POST(req: Request) {
  const auth = await requireUserSession();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const payload = await req.json();
  const parsed = submitQuizSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  await connectDB();

  const user = await User.findOne({ email: auth.session.user.email }).lean();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const category = await Category.findById(parsed.data.categoryId).lean();

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const questionIds = parsed.data.answers.map((answer) => answer.questionId);

  const questions = await Question.find(
    {
      _id: { $in: questionIds },
      category: parsed.data.categoryId,
      isActive: true,
    },
    { question: 1, options: 1, correctAnswer: 1 }
  ).lean();

  if (questions.length === 0) {
    return NextResponse.json({ error: "No valid questions in submission" }, { status: 400 });
  }

  const questionById = new Map(
    questions.map((question) => [
      question._id.toString(),
      {
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
      },
    ])
  );

  let score = 0;
  const normalizedAnswers: Array<{ questionId: string; selected: number; correct: number }> = [];

  for (const answer of parsed.data.answers) {
    const question = questionById.get(answer.questionId);

    if (!question) {
      continue;
    }

    if (answer.selected === question.correctAnswer) {
      score += 1;
    }

    normalizedAnswers.push({
      questionId: answer.questionId,
      selected: answer.selected,
      correct: question.correctAnswer,
    });
  }

  if (normalizedAnswers.length === 0) {
    return NextResponse.json({ error: "No valid answers submitted" }, { status: 400 });
  }

  const attempt = await QuizAttempt.create({
    userId: user._id,
    categoryId: category._id,
    score,
    total: normalizedAnswers.length,
    answers: normalizedAnswers,
  });

  const answerReview = normalizedAnswers.map((answer) => {
    const question = questionById.get(answer.questionId);
    const selectedOption = question?.options?.[answer.selected] ?? "Unknown";
    const correctOption = question?.options?.[answer.correct] ?? "Unknown";

    return {
      questionId: answer.questionId,
      question: question?.question ?? "Question unavailable",
      options: question?.options ?? [],
      selected: answer.selected,
      correct: answer.correct,
      selectedOption,
      correctOption,
      isCorrect: answer.selected === answer.correct,
    };
  });

  return NextResponse.json(
    {
      message: "Quiz submitted",
      result: {
        attemptId: attempt._id.toString(),
        categoryId: category._id.toString(),
        score,
        total: normalizedAnswers.length,
        correctCount: score,
        wrongCount: normalizedAnswers.length - score,
        percentage: Math.round((score / normalizedAnswers.length) * 100),
        answers: normalizedAnswers,
        answerReview,
        submittedAt: attempt.createdAt,
      },
    },
    { status: 201 }
  );
}