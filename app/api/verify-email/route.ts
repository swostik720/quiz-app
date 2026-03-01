import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { verifyEmailSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  const payload = await req.json();
  const parsed = verifyEmailSchema.safeParse({
    token: typeof payload?.token === "string" ? payload.token.trim() : payload?.token,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { token } = parsed.data;

  await connectDB();

  const user = await User.findOne({
    verifyEmailToken: token,
    verifyEmailTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 });
  }

  user.isVerified = true;
  user.verifyEmailToken = undefined;
  user.verifyEmailTokenExpiry = undefined;
  await user.save();

  return NextResponse.json({ message: "Email verified successfully" });
}
