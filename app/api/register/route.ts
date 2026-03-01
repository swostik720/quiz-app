import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { registerSchema } from "@/lib/validations/auth";
import { transporter } from "@/lib/mail";

export async function POST(req: Request) {
    await connectDB();

    const payload = await req.json();
    const parsed = registerSchema.safeParse(payload);

    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? "Invalid input" },
            { status: 400 }
        );
    }

    const { fullName, email, password } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
        return NextResponse.json(
            { error: "User already exists" },
            { status: 400 }
        );
    }

    const hashed = await bcrypt.hash(password, 10);
    const verifyEmailToken = crypto.randomBytes(32).toString("hex");
    const verifyEmailTokenExpiry = Date.now() + 1000 * 60 * 60 * 24;

    await User.create({
        fullName,
        email: normalizedEmail,
        password: hashed,
        role: "user",
        isVerified: false,
        verifyEmailToken,
        verifyEmailTokenExpiry,
    });

    const verifyLink = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${verifyEmailToken}`;

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: normalizedEmail,
        subject: "Verify your email",
        html: `<p>Please verify your account by clicking <a href="${verifyLink}">this link</a>.</p>`,
    });

    return NextResponse.json({ message: "User created. Please verify your email." });
}