import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
    matcher: ["/dashboard/:path*", "/profile/:path*", "/admin/:path*", "/quiz/:path*", "/results/:path*"],
};

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = request.nextUrl;

    if (!token) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith("/admin") && token.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}