import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import { requireAdminSession } from "@/lib/api-guards";
import Category from "@/models/Category";
import { adminCategorySchema, objectIdSchema } from "@/lib/validations/quiz";

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function buildUniqueSlug(title: string, excludeId: string) {
  const base = toSlug(title);
  let slug = base;
  let index = 2;

  while (await Category.exists({ _id: { $ne: excludeId }, slug })) {
    slug = `${base}-${index}`;
    index += 1;
  }

  return slug;
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminSession();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { id } = await context.params;
  const idParsed = objectIdSchema.safeParse(id);

  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
  }

  const payload = await req.json();
  const parsed = adminCategorySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  await connectDB();

  const title = parsed.data.title.trim();
  const slug = await buildUniqueSlug(title, idParsed.data);

  const duplicate = await Category.findOne({
    _id: { $ne: idParsed.data },
    title,
  }).lean();

  if (duplicate) {
    return NextResponse.json({ error: "Category already exists" }, { status: 409 });
  }

  const updated = await Category.findByIdAndUpdate(
    idParsed.data,
    {
      title,
      slug,
      description: parsed.data.description ?? "",
      image: parsed.data.image ?? "",
      isActive: parsed.data.isActive ?? true,
    },
    { new: true }
  ).lean();

  if (!updated) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  return NextResponse.json({
    message: "Category updated",
    category: {
      id: updated._id.toString(),
      title: updated.title,
      slug: updated.slug,
      description: updated.description,
      image: updated.image,
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
    return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
  }

  await connectDB();

  const deleted = await Category.findByIdAndDelete(idParsed.data).lean();

  if (!deleted) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Category deleted" });
}