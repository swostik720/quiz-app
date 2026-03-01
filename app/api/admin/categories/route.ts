import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import { requireAdminSession } from "@/lib/api-guards";
import Category from "@/models/Category";
import { adminCategorySchema } from "@/lib/validations/quiz";

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function buildUniqueSlug(title: string) {
  const base = toSlug(title);
  let slug = base;
  let index = 2;

  while (await Category.exists({ slug })) {
    slug = `${base}-${index}`;
    index += 1;
  }

  return slug;
}

export async function GET() {
  const auth = await requireAdminSession();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  await connectDB();

  const categories = await Category.find({}).sort({ createdAt: -1 }).lean();

  return NextResponse.json({
    categories: categories.map((category) => ({
      id: category._id.toString(),
      title: category.title,
      slug: category.slug,
      description: category.description,
      image: category.image,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    })),
  });
}

export async function POST(req: Request) {
  const auth = await requireAdminSession();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
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
  const slug = await buildUniqueSlug(title);

  const existing = await Category.findOne({ title }).lean();

  if (existing) {
    return NextResponse.json({ error: "Category already exists" }, { status: 409 });
  }

  const created = await Category.create({
    title,
    slug,
    description: parsed.data.description ?? "",
    image: parsed.data.image ?? "",
    isActive: parsed.data.isActive ?? true,
  });

  return NextResponse.json(
    {
      message: "Category created",
      category: {
        id: created._id.toString(),
        title: created.title,
        slug: created.slug,
        description: created.description,
        image: created.image,
        isActive: created.isActive,
      },
    },
    { status: 201 }
  );
}