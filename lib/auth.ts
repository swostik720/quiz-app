import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "./mongodb";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: {},
                password: {},
            },

            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }

                const normalizedEmail = credentials.email.trim().toLowerCase();

                await connectDB();

                const user = await User.findOne({ email: normalizedEmail });

                if (!user) throw new Error("User not found");

                if (!user.isVerified) {
                    throw new Error("Please verify your email before logging in");
                }

                const isValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isValid) throw new Error("Invalid password");

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.fullName,
                    role: user.role as "user" | "admin",
                };
            },
        }),
    ],

    session: {
        strategy: "jwt",
    },

    callbacks: {
        async jwt({ token, user }) {
            if (user) token.role = user.role;
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.role = (token.role as "user" | "admin") ?? "user";
            }
            return session;
        },
    },

    pages: {
        signIn: "/login",
    },

    secret: process.env.NEXTAUTH_SECRET,
};