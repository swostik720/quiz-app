import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { resetPasswordSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  await connectDB();

  const payload = await req.json();
  const parsed = resetPasswordSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { token, password } = parsed.data;

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 }
    );
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;

  await user.save();

  return NextResponse.json({ message: "Password updated" });
}