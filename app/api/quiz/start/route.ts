import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import { requireUserSession } from "@/lib/api-guards";
import Category from "@/models/Category";
import Question from "@/models/Questions";
import { startQuizQuerySchema } from "@/lib/validations/quiz";

export async function GET(req: Request) {
  const auth = await requireUserSession();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const url = new URL(req.url);
  const parsed = startQuizQuerySchema.safeParse({
    categoryId: url.searchParams.get("categoryId"),
    count: url.searchParams.get("count") ?? 10,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid query" },
      { status: 400 }
    );
  }

  await connectDB();

  const category = await Category.findOne({ _id: parsed.data.categoryId, isActive: true }).lean();

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const questions = await Question.aggregate([
    {
      $match: {
        category: category._id,
        isActive: true,
      },
    },
    { $sample: { size: parsed.data.count } },
    {
      $project: {
        question: 1,
        options: 1,
        difficulty: 1,
      },
    },
  ]);

  return NextResponse.json({
    category: {
      id: category._id.toString(),
      title: category.title,
      slug: category.slug,
    },
    questions: questions.map((question) => ({
      id: question._id.toString(),
      question: question.question,
      options: question.options,
      difficulty: question.difficulty,
    })),
  });
}