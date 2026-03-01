import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import { requireAdminSession } from "@/lib/api-guards";
import Category from "@/models/Category";
import Question from "@/models/Questions";
import { adminQuestionSchema, objectIdSchema } from "@/lib/validations/quiz";

export async function GET(req: Request) {
  const auth = await requireAdminSession();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const url = new URL(req.url);
  const categoryId = url.searchParams.get("categoryId");
  const parsedPage = Number(url.searchParams.get("page") || 1);
  const parsedLimit = Number(url.searchParams.get("limit") || 20);
  const page = Number.isFinite(parsedPage) ? Math.max(parsedPage, 1) : 1;
  const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 100) : 20;

  await connectDB();

  const filter: Record<string, unknown> = {};

  if (categoryId) {
    const parsedId = objectIdSchema.safeParse(categoryId);
    if (!parsedId.success) {
      return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
    }
    filter.category = parsedId.data;
  }

  const skip = (page - 1) * limit;

  const [questions, totalCount] = await Promise.all([
    Question.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Question.countDocuments(filter),
  ]);

  return NextResponse.json({
    page,
    limit,
    totalCount,
    totalPages: Math.max(Math.ceil(totalCount / limit), 1),
    questions: questions.map((question) => ({
      id: question._id.toString(),
      categoryId: question.category.toString(),
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      difficulty: question.difficulty,
      isActive: question.isActive,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    })),
  });
}

export async function POST(req: Request) {
  const auth = await requireAdminSession();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const payload = await req.json();
  const parsed = adminQuestionSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  await connectDB();

  const categoryExists = await Category.exists({ _id: parsed.data.categoryId, isActive: true });

  if (!categoryExists) {
    return NextResponse.json({ error: "Category not found or inactive" }, { status: 404 });
  }

  const created = await Question.create({
    category: parsed.data.categoryId,
    question: parsed.data.question,
    options: parsed.data.options,
    correctAnswer: parsed.data.correctAnswer,
    difficulty: parsed.data.difficulty ?? "easy",
    isActive: parsed.data.isActive ?? true,
  });

  return NextResponse.json(
    {
      message: "Question created",
      question: {
        id: created._id.toString(),
        categoryId: created.category.toString(),
        question: created.question,
        options: created.options,
        correctAnswer: created.correctAnswer,
        difficulty: created.difficulty,
        isActive: created.isActive,
      },
    },
    { status: 201 }
  );
}