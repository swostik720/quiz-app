import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";

import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { changePasswordSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await req.json();
  const parsed = changePasswordSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { currentPassword, newPassword } = parsed.data;

  await connectDB();

  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);

  if (!isValid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return NextResponse.json({ message: "Password updated successfully" });
}
