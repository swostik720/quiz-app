import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { adminUpdateRoleSchema } from "@/lib/validations/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const users = await User.find({}, { fullName: 1, email: 1, role: 1, createdAt: 1 })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({
    users: users.map((user) => ({
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    })),
  });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = await req.json();
  const parsed = adminUpdateRoleSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { userId, role } = parsed.data;

  await connectDB();

  const updated = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true, projection: { fullName: 1, email: 1, role: 1, createdAt: 1 } }
  ).lean();

  if (!updated) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    message: "Role updated",
    user: {
      id: updated._id.toString(),
      fullName: updated.fullName,
      email: updated.email,
      role: updated.role,
      createdAt: updated.createdAt,
    },
  });
}
