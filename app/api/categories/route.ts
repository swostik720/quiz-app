import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";

export async function GET() {
  await connectDB();

  const categories = await Category.find({ isActive: true }, { title: 1, slug: 1, description: 1, image: 1 })
    .sort({ title: 1 })
    .lean();

  return NextResponse.json({
    categories: categories.map((category) => ({
      id: category._id.toString(),
      title: category.title,
      slug: category.slug,
      description: category.description,
      image: category.image,
    })),
  });
}