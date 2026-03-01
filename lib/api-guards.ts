import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requireUserSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      ok: false as const,
      status: 401,
      message: "Unauthorized",
    };
  }

  return {
    ok: true as const,
    session,
  };
}

export async function requireAdminSession() {
  const userResult = await requireUserSession();

  if (!userResult.ok) {
    return userResult;
  }

  if (userResult.session.user.role !== "admin") {
    return {
      ok: false as const,
      status: 403,
      message: "Forbidden",
    };
  }

  return userResult;
}