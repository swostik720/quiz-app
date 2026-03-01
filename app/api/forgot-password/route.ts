import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { transporter } from "@/lib/mail";
import { forgotPasswordSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  await connectDB();

  const payload = await req.json();
  const parsed = forgotPasswordSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { email } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const token = crypto.randomBytes(32).toString("hex");

  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 3600000; // 1 hour

  await user.save();

  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: normalizedEmail,
    subject: "Reset Password",
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password</p>`,
  });

  return NextResponse.json({ message: "Reset email sent" });
}