import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import { requireAdminSession } from "@/lib/api-guards";
import Category from "@/models/Category";
import Question from "@/models/Questions";
import { adminQuestionSchema, objectIdSchema } from "@/lib/validations/quiz";

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminSession();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { id } = await context.params;
  const idParsed = objectIdSchema.safeParse(id);

  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid question id" }, { status: 400 });
  }

  await connectDB();

  const question = await Question.findById(idParsed.data).lean();

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  return NextResponse.json({
    question: {
      id: question._id.toString(),
      categoryId: question.category.toString(),
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      difficulty: question.difficulty,
      isActive: question.isActive,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    },
  });
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminSession();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { id } = await context.params;
  const idParsed = objectIdSchema.safeParse(id);

  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid question id" }, { status: 400 });
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

  const updated = await Question.findByIdAndUpdate(
    idParsed.data,
    {
      category: parsed.data.categoryId,
      question: parsed.data.question,
      options: parsed.data.options,
      correctAnswer: parsed.data.correctAnswer,
      difficulty: parsed.data.difficulty ?? "easy",
      isActive: parsed.data.isActive ?? true,
    },
    { new: true }
  ).lean();

  if (!updated) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  return NextResponse.json({
    message: "Question updated",
    question: {
      id: updated._id.toString(),
      categoryId: updated.category.toString(),
      question: updated.question,
      options: updated.options,
      correctAnswer: updated.correctAnswer,
      difficulty: updated.difficulty,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    },
  });
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminSession();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { id } = await context.params;
  const idParsed = objectIdSchema.safeParse(id);

  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid question id" }, { status: 400 });
  }

  await connectDB();

  const deleted = await Question.findByIdAndDelete(idParsed.data).lean();

  if (!deleted) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Question deleted" });
}